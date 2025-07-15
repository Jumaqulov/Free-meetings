import React from "react";

export default function NameModal({ userName, setUserName, onJoin }) {
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
                    onClick={onJoin}
                >
                    Meetingga kirish
                </button>
            </div>
        </div>
    );
}
