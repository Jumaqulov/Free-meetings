import React from "react";
import VideoPlayer from "./VideoPlayer";

function getGridCols(n) {
    if (n === 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-1 sm:grid-cols-2";
    if (n === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (n === 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2";
    if (n <= 6) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
}

function getGridRows(n) {
    if (n === 1) return "grid-rows-1";
    if (n === 2) return "grid-rows-2 sm:grid-rows-1";
    if (n === 3) return "grid-rows-3 sm:grid-rows-2 lg:grid-rows-1";
    if (n === 4) return "grid-rows-2";
    if (n <= 6) return "grid-rows-3 lg:grid-rows-2";
    return "grid-rows-3 lg:grid-rows-2";
}

function getGridHeight(n) {
    if (n === 1) return "h-[80vh] min-h-[300px]";
    if (n === 2) return "h-[75vh] min-h-[300px]";
    if (n === 3 || n === 4) return "h-[70vh] min-h-[320px]";
    return "h-[65vh] min-h-[320px]";
}

function getVideoClass() {
    // Full width, aspect-video (16:9), object-cover
    return "w-full h-full object-cover rounded-xl bg-black";
}

export default function VideoGrid({ peers }) {
    const n = peers.length;

    return (
        <div
            className={`
        grid gap-2
        ${getGridCols(n)} ${getGridRows(n)}
        ${getGridHeight(n)}
        w-full max-w-[97vw] mx-auto
        p-2
      `}
        >
            {peers.map((peer) => {
                const videoEnabled = peer.stream?.getVideoTracks()?.some(t => t.enabled);
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
