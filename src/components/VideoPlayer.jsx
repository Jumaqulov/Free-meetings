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
        let rafId;

        const attachStream = () => {
            const video = videoRef.current;
            console.log(`[VideoPlayer] trying to attach stream for peer:`, peer.userName);
            if (!peer.stream) {
                console.warn(`[VideoPlayer] stream is not yet available for`, peer.userName);
            }
            if (!video) {
                console.warn(`[VideoPlayer] videoRef.current is null for`, peer.userName);
            }

            if (video && peer.stream) {
                video.srcObject = peer.stream;
                console.log(`[VideoPlayer] ✅ stream attached to video for`, peer.userName);
            } else {
                rafId = requestAnimationFrame(attachStream); // kutishda davom etadi
            }
        };

        attachStream();

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [peer.stream]);

    return (
        <div className="relative flex flex-col items-center bg-black rounded-2xl shadow-xl overflow-hidden border-2 border-cyan-200 transition-all duration-300 w-full h-full">
            {isVideoEnabled && peer.stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={self}
                    playsInline
                    className={videoClass}
                    style={{ borderRadius: 16 }}
                    onLoadedMetadata={() => {
                        console.log(`[VideoPlayer] ▶️ Video metadata loaded for`, peer.userName);
                    }}
                    onError={(e) => {
                        console.error(`[VideoPlayer] ❌ Error loading video for`, peer.userName, e);
                    }}
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
