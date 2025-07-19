import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NameModal from "../components/NameModal";
import VideoGrid from "../components/VideoGrid";
import Toolbar from "../components/Toolbar";

const SOCKET_SERVER = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_SERVER, {
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
            console.log("[handleJoin] ✅ Stream olindi:", stream);
            setMyStream(stream);
            setNameModal(false);

            socket.connect();
            socket.on("connect", () => {
                console.log("[Socket] ✅ Ulandi:", socket.id);
                socket.emit("join-room", { roomId, userName });
            });
        } catch (err) {
            console.error("[handleJoin] ❌ Stream olishda xatolik:", err);
            alert("Kamera va mikrofonni yoqib ruxsat bering.");
        }
    };

    useEffect(() => {
        if (!myStream) {
            console.log("[useEffect] ⏳ myStream hali mavjud emas");
            return;
        }

        console.log("[useEffect] ✅ myStream mavjud, socket listeners tayyorlanyapti");

        socket.on("init-users", (clients) => {
            console.log("[Socket] 🟡 init-users:", clients);
            setPeers([
                { id: socket.id, userName, stream: myStream, self: true },
                ...clients.map(c => ({
                    id: c.id,
                    userName: c.userName,
                    stream: null,
                    self: false
                }))
            ]);
            clients.forEach(c => createPeerConnection(c.id, c.userName, true));
        });

        socket.on("user-joined", ({ id, userName: newName }) => {
            console.log("[Socket] ➕ user-joined:", newName, id);
            toast.info(`${newName} xonaga qo‘shildi!`);
            setPeers(old => [
                ...old,
                { id, userName: newName, stream: null, self: false }
            ]);
            createPeerConnection(id, newName, false);
        });

        socket.on("signal", async ({ from, signal, userName: remoteName }) => {
            console.log("[Socket] 📶 signal qabul qilindi:", { from, signal });
            let pc = peersRef.current[from];
            if (!pc) {
                console.log("[Peer] 🔧 createPeerConnection (first-time) uchun:", remoteName);
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

        socket.on("user-left", (id) => {
            console.log("[Socket] ❌ user-left:", id);
            setPeers(old => old.filter(p => p.id !== id));
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
        });

        return () => {
            console.log("[useEffect] 🧹 Tozalanyapti (cleanup)");
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
        console.log("[Peer] 🔗 Yaratilmoqda:", { id, remoteName, initiator });
        const pc = new RTCPeerConnection(iceConfig);

        myStream.getTracks().forEach(track => {
            console.log("[Peer] 🎤 Track qo‘shilmoqda:", track.kind);
            pc.addTrack(track, myStream);
        });

        pc.onicecandidate = e => {
            if (e.candidate) {
                console.log("[Peer] ❄️ ICE candidate:", e.candidate);
                socket.emit("signal", { to: id, signal: e.candidate });
            }
        };

        pc.ontrack = e => {
            console.log("[Peer] 🎥 ontrack - stream qabul qilindi:", e.streams[0]);
            setPeers(old => old.map(p => {
                if (p.id === id) return { ...p, stream: e.streams[0] };
                return p;
            }));
        };

        if (initiator) {
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log("[Peer] 📨 Offer yaratildi:", offer);
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