import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, { autoConnect: false });

const iceConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function getInitials(name = "") {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

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

    const isVideoEnabled = (peer) => {
        if (!peer.stream) return false;
        const videoTracks = peer.stream.getVideoTracks();
        if (!videoTracks.length) return false;
        return videoTracks.some(track => track.enabled);
    };

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
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
                <div className="bg-white rounded-xl p-8 flex flex-col gap-4 items-center shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-700">Ismingizni kiriting</h2>
                    <input
                        className="border px-4 py-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Ism..."
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        maxLength={32}
                        autoFocus
                    />
                    <button
                        className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg px-6 py-2 text-lg font-semibold transition"
                        disabled={!userName.trim()}
                        onClick={handleJoin}
                    >
                        Meetingga kirish
                    </button>
                </div>
            </div>
        );
    }

    function getGridClass(n) {
        if (n === 1) return "grid-cols-1 grid-rows-1";
        if (n === 2) return "grid-cols-2 grid-rows-1";
        if (n === 3) return "grid-cols-2 grid-rows-2";
        if (n === 4) return "grid-cols-2 grid-rows-2";
        if (n <= 6) return "grid-cols-3 grid-rows-2";
        return "grid-cols-4 grid-rows-2";
    }

    function getGridHeight(n) {
        if (n === 1) return "h-[82vh] min-h-[340px]";
        if (n === 2) return "h-[82vh] min-h-[340px]";
        if (n === 3 || n === 4) return "h-[85vh] min-h-[350px]";
        return "h-[88vh] min-h-[320px]";
    }

    function getVideoBoxClass(n) {
        return "w-full h-full flex flex-col items-center justify-center";
    }

    function getVideoClass() {
        return "w-full aspect-video object-cover rounded-xl bg-black";
    }

    return (
        <div className="h-screen min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-100 flex flex-col items-center py-7">
            <h3 className="text-xl font-bold text-emerald-800 mb-4 mt-3">Xona ID: {roomId}</h3>
            <div
                className={`grid ${getGridClass(peers.length)} gap-4 place-items-center w-full max-w-[97vw] mx-auto rounded-xl shadow-lg bg-white/30 backdrop-blur-sm p-3 ${getGridHeight(peers.length)}`}
            >
                {peers.map((peer, idx) => {
                    const videoEnabled = isVideoEnabled(peer);
                    return (
                        <div
                            key={peer.id}
                            className={`relative flex flex-col items-center bg-black rounded-2xl shadow-xl overflow-hidden border-2 border-cyan-200 transition-all duration-300 ${getVideoBoxClass(peers.length)} ${peers.length === 3 && idx === 2 ? "col-span-2" : ""}`}
                        >
                            {videoEnabled ? (
                                <video
                                    ref={el => {
                                        if (el && peer.stream) el.srcObject = peer.stream;
                                    }}
                                    autoPlay
                                    muted={peer.self}
                                    playsInline
                                    className={`${getVideoClass()} transition-all duration-300`}
                                    style={{ borderRadius: 16 }}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-cyan-100">
                                    <div className="flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-cyan-300 shadow-xl border-4 border-cyan-400 select-none">
                                        <span className="text-cyan-700 font-extrabold text-4xl">
                                            {getInitials(peer.userName)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <span className="absolute left-3 bottom-3 px-2 py-1 text-xs rounded-md bg-white/60 text-cyan-700 font-bold shadow">
                                {peer.self ? "Siz: " : ""}{peer.userName}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="w-full flex justify-center mt-2 mb-1 z-20">
                <div className="flex gap-6 bg-white/80 backdrop-blur-lg px-7 py-4 rounded-full shadow-lg border border-cyan-100">
                    <button
                        className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl transition 
              ${micOn ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-500 hover:bg-red-200"}`}
                        onClick={() => {
                            if (!myStream) return;
                            myStream.getAudioTracks().forEach(track => track.enabled = !micOn);
                            setMicOn(m => !m);
                        }}
                        aria-label={micOn ? "Mikrofonni o'chirish" : "Mikrofonni yoqish"}
                    >
                        <FaMicrophone />
                    </button>

                    <button
                        className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl transition
              ${camOn ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-500 hover:bg-red-200"}`}
                        onClick={() => {
                            if (!myStream) return;
                            myStream.getVideoTracks().forEach(track => track.enabled = !camOn);
                            setCamOn(c => !c);
                        }}
                        aria-label={camOn ? "Kamerani o'chirish" : "Kamerani yoqish"}
                    >
                        <FaVideo />
                    </button>

                    <button
                        className="flex items-center justify-center w-12 h-12 rounded-full text-2xl bg-red-500 text-white hover:bg-red-700 transition shadow-lg"
                        onClick={() => {
                            socket.disconnect();
                            navigate("/");
                        }}
                        aria-label="Meetingdan chiqish"
                    >
                        <FaPhoneSlash />
                    </button>
                </div>
            </div>
        </div>
    );
}
