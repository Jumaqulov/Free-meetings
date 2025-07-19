import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NameModal from "../components/NameModal";
import VideoGrid from "../components/VideoGrid";
import Toolbar from "../components/Toolbar";

const SOCKET_URL = "http://localhost:5000";

const socket = io(window.location.origin, {
    path: "/socket.io",
    transports: ["websocket"]
});

const iceConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function MeetingPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [nameModal, setNameModal] = useState(true);
    const [peers, setPeers] = useState([]);         // { id, userName, stream, self }
    const peersRef = useRef({});                    // id → RTCPeerConnection
    const [myStream, setMyStream] = useState(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    // Foydalanuvchi kamerani ochib xonaga qo'shiladi
    const handleJoin = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setMyStream(stream);
            setNameModal(false);

            socket.connect();
            socket.on("connect", () => {
                socket.emit("join-room", { roomId, userName });
            });
        } catch (err) {
            alert("Kamera va mikrofonni yoqib ruxsat bering.");
        }
    };

    useEffect(() => {
        if (!myStream) return;

        // 1) Joiner: existing foydalanuvchilarni qabul qiladi
        socket.on("init-users", (clients) => {
            // boshida o'zimizni qo'shamiz
            setPeers([
                { id: socket.id, userName, stream: myStream, self: true },
                // keyin existing peer'larni qo'shamiz (stream keyin ontrack orqali keladi)
                ...clients.map(c => ({
                    id: c.id,
                    userName: c.userName,
                    stream: null,
                    self: false
                }))
            ]);
            // existing bilan bog'lanish – initiator = true
            clients.forEach(c => createPeerConnection(c.id, c.userName, true));
        });

        // 2) Boshqalar: yangi joiner haqida xabar oladi
        socket.on("user-joined", ({ id, userName: newName }) => {
            toast.info(`${newName} xonaga qo‘shildi!`);
            // yangi user bilan bog'lanish – initiator = false
            setPeers(old => [
                ...old,
                { id, userName: newName, stream: null, self: false }
            ]);
            createPeerConnection(id, newName, false);
        });

        // 3) Signal (offer/answer/candidate) qabul qilish
        socket.on("signal", async ({ from, signal, userName: remoteName }) => {
            let pc = peersRef.current[from];
            if (!pc) {
                // offer qabul qilinishidan oldin ham kerak bo'lsa
                setPeers(old => [
                    ...old,
                    { id: from, userName: remoteName, stream: null, self: false }
                ]);
                pc = createPeerConnection(from, remoteName, false);
            }

            if (signal.type === "offer") {
                await pc.setRemoteDescription(signal);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("signal", { to: from, signal: pc.localDescription });
            } else if (signal.type === "answer") {
                if (pc.signalingState === "have-local-offer") {
                    await pc.setRemoteDescription(signal);
                }
            } else if (signal.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(signal));
            }
        });

        // 4) User left
        socket.on("user-left", (id) => {
            setPeers(old => old.filter(p => p.id !== id));
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
        });

        return () => {
            socket.off("init-users");
            socket.off("user-joined");
            socket.off("signal");
            socket.off("user-left");
            socket.disconnect();
            Object.values(peersRef.current).forEach(pc => pc.close());
            peersRef.current = {};
        };
    }, [myStream, userName]);

    // PeerConnection yaratish funksiyasi
    function createPeerConnection(id, remoteName, initiator) {
        const pc = new RTCPeerConnection(iceConfig);
        // media track larni yuborish
        myStream.getTracks().forEach(track => pc.addTrack(track, myStream));

        // ICE candidate'larni serverga uzatish
        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.emit("signal", { to: id, signal: e.candidate });
            }
        };

        // remote media kelganda peers ga qo'shish
        pc.ontrack = e => {
            setPeers(old => old.map(p => {
                if (p.id === id) return { ...p, stream: e.streams[0] };
                return p;
            }));
        };

        // initiator uchun offer yaratish trigger
        if (initiator) {
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("signal", { to: id, signal: pc.localDescription });
            };
        }

        peersRef.current[id] = pc;
        return pc;
    }

    // mikrofon toggle
    const handleToggleMic = () => {
        myStream.getAudioTracks().forEach(t => (t.enabled = !micOn));
        setMicOn(v => !v);
    };
    // kamera toggle
    const handleToggleCam = () => {
        myStream.getVideoTracks().forEach(t => (t.enabled = !camOn));
        setCamOn(v => !v);
    };

    const handleLeave = () => {
        socket.disconnect();
        navigate("/");
    };

    if (nameModal) {
        return (
            <NameModal
                userName={userName}
                setUserName={setUserName}
                onJoin={handleJoin}
            />
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-100 flex flex-col items-center relative">
            <VideoGrid peers={peers} />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                <Toolbar
                    micOn={micOn}
                    camOn={camOn}
                    toggleMic={handleToggleMic}
                    toggleCam={handleToggleCam}
                    leave={handleLeave}
                />
            </div>
            <ToastContainer />
        </div>
    );
}