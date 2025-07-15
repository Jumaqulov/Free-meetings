import React, { useEffect, useRef } from "react";

function getInitials(name = "") {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

export default function VideoPlayer({ peer, self, isVideoEnabled, videoClass }) {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && peer.stream) {
            videoRef.current.srcObject = peer.stream;
        }
    }, [peer.stream]);

    return (
        <div className="relative flex flex-col items-center bg-black rounded-2xl shadow-xl overflow-hidden border-2 border-cyan-200 transition-all duration-300 w-full h-full">
            {isVideoEnabled ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={self}
                    playsInline
                    className={videoClass}
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
                {self ? "Siz: " : ""}
                {peer.userName}
            </span>
        </div>
    );
}
