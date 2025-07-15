import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

import NameModal from "../components/NameModal";
import VideoGrid from "../components/VideoGrid";
import Toolbar from "../components/Toolbar";

const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, { autoConnect: false });

const iceConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function MeetingPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [nameModal, setNameModal] = useState(true);
    const [peers, setPeers] = useState([]);
    const [myId, setMyId] = useState("");
    const myVideo = useRef();
    const peersRef = useRef({});
    const [myStream, setMyStream] = useState(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const handleJoin = async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(localStream);
            setNameModal(false);
            socket.connect();
            setMyId(socket.id);

            socket.emit("join-room", { roomId, userName });

            if (myVideo.current) myVideo.current.srcObject = localStream;
        } catch (err) {
            alert("Kamera va mikrofonni yoqib qo‘ying va ruxsat bering.");
        }
    };

    useEffect(() => {
        if (!myStream) return;

        socket.on("all-users", (clients) => {
            const others = clients.filter((c) => c.id !== socket.id);
            setPeers(oldPeers => [
                {
                    id: socket.id,
                    userName: userName,
                    stream: myStream,
                    self: true,
                },
                ...oldPeers.filter(p => !p.self),
            ]);
            others.forEach(client => createPeerConnection(client.id, client.userName, true));
        });

        socket.on("signal", async ({ from, signal, userName: remoteName }) => {
            let peerConnection = peersRef.current[from];
            if (!peerConnection) {
                peerConnection = createPeerConnection(from, remoteName, false);
            }
            if (signal.type === "offer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit("signal", { to: from, signal: peerConnection.localDescription });
            } else if (signal.type === "answer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
            }
        });

        socket.on("user-left", (id) => {
            setPeers(oldPeers => oldPeers.filter(p => p.id !== id));
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
        });

        return () => {
            socket.off("all-users");
            socket.off("signal");
            socket.off("user-left");
            socket.disconnect();
            Object.values(peersRef.current).forEach(pc => pc.close());
            peersRef.current = {};
        };
    }, [myStream]);

    function createPeerConnection(id, remoteName, initiator) {
        const pc = new RTCPeerConnection(iceConfig);
        myStream.getTracks().forEach(track => pc.addTrack(track, myStream));

        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.emit("signal", { to: id, signal: { candidate: e.candidate } });
            }
        };

        pc.ontrack = e => {
            setPeers(oldPeers => {
                if (oldPeers.find(p => p.id === id)) return oldPeers;
                return [...oldPeers, { id, userName: remoteName, stream: e.streams[0], self: false }];
            });
        };

        peersRef.current[id] = pc;

        if (initiator) {
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("signal", { to: id, signal: pc.localDescription });
            };
        }
        return pc;
    }

    const handleToggleMic = () => {
        if (!myStream) return;
        myStream.getAudioTracks().forEach(track => {
            track.enabled = !micOn;
        });
        setMicOn(m => !m);
    };

    const handleToggleCam = () => {
        if (!myStream) return;
        myStream.getVideoTracks().forEach(track => {
            track.enabled = !camOn;
        });
        setCamOn(c => !c);
    };

    const handleLeave = () => {
        socket.disconnect();
        navigate("/");
    };

    if (nameModal) {
        return <NameModal userName={userName} setUserName={setUserName} onJoin={handleJoin} />;
    }

    return (
        <div className="h-screen min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-100 flex flex-col items-center py-7">
            <VideoGrid peers={peers} />
            <Toolbar
                micOn={micOn}
                camOn={camOn}
                toggleMic={handleToggleMic}
                toggleCam={handleToggleCam}
                leave={handleLeave}
            />
        </div>
    );
}
