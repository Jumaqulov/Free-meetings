import React from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";

export default function Toolbar({ micOn, camOn, toggleMic, toggleCam, leave }) {
    return (
        <div className="w-full flex justify-center mt-2 mb-1 z-20">
            <div className="flex gap-6 bg-white/80 backdrop-blur-lg px-7 py-4 rounded-full shadow-lg border border-cyan-100">
                <button
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl transition 
            ${micOn ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-500 hover:bg-red-200"}`}
                    onClick={toggleMic}
                    aria-label={micOn ? "Mikrofonni o'chirish" : "Mikrofonni yoqish"}
                >
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>

                <button
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl transition
            ${camOn ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-500 hover:bg-red-200"}`}
                    onClick={toggleCam}
                    aria-label={camOn ? "Kamerani o'chirish" : "Kamerani yoqish"}
                >
                    {camOn ? <FaVideo /> : <FaVideoSlash />}
                </button>

                <button
                    className="flex items-center justify-center w-12 h-12 rounded-full text-2xl bg-red-500 text-white hover:bg-red-700 transition shadow-lg"
                    onClick={leave}
                    aria-label="Meetingdan chiqish"
                >
                    <FaPhoneSlash />
                </button>
            </div>
        </div>
    );
}
