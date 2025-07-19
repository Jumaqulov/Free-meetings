import React, { useState } from "react";
import { FaInstagram, FaTelegram, FaLinkedin, FaGithub, FaCopy } from "react-icons/fa";
import { Link } from "react-router-dom";

function generateRoomId() {
    let id = '';
    for (let i = 0; i < 5; i++) {
        id += Math.floor(Math.random() * 10);
    }
    return id;
}

export default function HomePage() {
    const [roomLink, setRoomLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCreateRoom = () => {
        const newRoomId = generateRoomId();
        setRoomLink(`/room/${newRoomId}`);
        setCopied(false);
    };

    const handleCopy = () => {
        if (!roomLink) return;
        navigator.clipboard.writeText(`${window.location.origin}${roomLink}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
    };

    return (
        <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#e7f7fd]">
            {/* NAVBAR */}
            <header className="relative z-10 w-full py-4 flex justify-between items-center px-8">
                <div className="flex items-center gap-2">
                    <Link to={'/'}>
                        <span className="text-2xl font-extrabold text-slate-800 tracking-tight drop-shadow">FreeMeeting</span>
                    </Link>
                </div>
                <nav>
                    <Link
                        to="/online-users"
                        className="text-slate-900 hover:text-emerald-500 font-semibold px-4 py-2 rounded transition"
                    >
                        Online foydalanuvchilar
                    </Link>
                </nav>
            </header>

            {/* MARKAZ */}
            <main className="relative z-10 flex flex-1 flex-col justify-center items-center">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center border border-cyan-100 backdrop-blur-lg">
                    <h1 className="text-3xl font-extrabold mb-7 text-cyan-600 text-center drop-shadow">
                        Xona yaratish
                    </h1>
                    <p className="text-lg text-gray-700 mb-6 text-center">
                        Ushbu platforma orqali istalgan vaqtda video konferensiyalarni yaratib, uni boshqarishingiz mumkin. Yangi xonalar yaratish va mavjud xonalar bilan ishlash juda oson va qulay.
                    </p>
                    <button
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg transition mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        onClick={handleCreateRoom}
                    >
                        Yangi xona yaratish
                    </button>
                    {roomLink && (
                        <div className="w-full text-center mt-3 animate-fade-in">
                            <span className="block text-slate-700 mb-1 font-medium">Xona linki:</span>
                            <div className="flex items-center justify-center gap-2">
                                <Link
                                    to={roomLink}
                                    className="break-all text-emerald-600 underline font-mono text-sm hover:text-cyan-600 transition"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {`${window.location.origin}${roomLink}`}
                                </Link>
                                <button
                                    className="text-emerald-700 hover:text-cyan-600 ml-1 px-2 py-1 rounded transition border border-transparent hover:border-cyan-300 bg-emerald-100/60"
                                    onClick={handleCopy}
                                    aria-label="Linkni nusxalash"
                                >
                                    <FaCopy size={16} />
                                </button>
                                {copied && (
                                    <span className="text-xs text-emerald-600 ml-2">Nusxalandi!</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 w-full py-6 flex flex-col items-center gap-2 bg-gradient-to-t from-white/40 via-white/10 to-transparent shadow-inner mt-8">
                <div className="flex gap-7 text-2xl mb-1">
                    <Link
                        to="https://www.instagram.com/jumaqulov__/"
                        className="text-slate-600 hover:text-fuchsia-500 transition"
                        target="_blank" rel="noopener noreferrer"
                        aria-label="Instagram"
                    >
                        <FaInstagram />
                    </Link>
                    <Link
                        to="https://t.me/Avazbey21"
                        className="text-slate-600 hover:text-cyan-500 transition"
                        target="_blank" rel="noopener noreferrer"
                        aria-label="Telegram"
                    >
                        <FaTelegram />
                    </Link>
                    <Link
                        to="https://www.linkedin.com/in/avazbek-jumaqulov-353b39280/"
                        className="text-slate-600 hover:text-blue-700 transition"
                        target="_blank" rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin />
                    </Link>
                    <Link
                        to="https://github.com/jumaqulov"
                        className="text-slate-600 hover:text-zinc-900 transition"
                        target="_blank" rel="noopener noreferrer"
                        aria-label="GitHub"
                    >
                        <FaGithub />
                    </Link>
                </div>
                <span className="text-xs text-slate-700 tracking-wider font-medium select-none">
                    © 2025 FreeMeeting. All rights reserved.
                </span>
            </footer>
        </div>
    );
}
