import React from "react";
import VideoPlayer from "./VideoPlayer";

function getGridClass(n) {
    if (n === 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-1 sm:grid-cols-2";
    if (n === 3) return "grid-cols-2";
    if (n === 4) return "grid-cols-2";
    if (n <= 6) return "grid-cols-3";
    return "grid-cols-4";
}

function getGridHeight(n) {
    if (n === 1) return "h-[70vh] min-h-[320px]";
    if (n === 2) return "h-[70vh] min-h-[320px]";
    if (n === 3 || n === 4) return "h-[75vh] min-h-[350px]";
    return "h-[80vh] min-h-[320px]";
}

function getVideoClass() {
    // Full width, aspect-video (16:9), object-cover (kesiladi va to‘ldiradi)
    return "w-full aspect-video object-cover rounded-xl bg-black";
}

export default function VideoGrid({ peers }) {
    return (
        <div
            className={`
        grid
        ${getGridClass(peers.length)}
        gap-4 place-items-center
        w-full max-w-[97vw] mx-auto rounded-xl shadow-lg bg-white/30 backdrop-blur-sm p-3
        ${getGridHeight(peers.length)}
      `}
        >
            {peers.map((peer, idx) => {
                const videoEnabled = peer.stream?.getVideoTracks()?.some(track => track.enabled);
                return (
                    <VideoPlayer
                        key={peer.id}
                        peer={peer}
                        self={peer.self}
                        isVideoEnabled={videoEnabled}
                        videoClass={getVideoClass()}
                    />
                );
            })}
        </div>
    );
}
