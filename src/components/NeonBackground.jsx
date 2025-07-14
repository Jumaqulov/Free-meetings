export default function NeonBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            <div className="absolute top-[-10%] left-[10%] w-[320px] h-[320px] bg-cyan-400 opacity-40 rounded-full blur-3xl animate-float1"></div>
            <div className="absolute bottom-[-8%] right-[5%] w-[400px] h-[400px] bg-emerald-300 opacity-35 rounded-full blur-3xl animate-float2"></div>
            <div className="absolute top-[55%] left-[55%] w-[220px] h-[220px] bg-sky-300 opacity-30 rounded-full blur-2xl animate-float3"></div>
            <svg className="absolute left-[38%] top-[21%] w-28 h-28 opacity-60 mix-blend-lighten animate-lightning1"
                viewBox="0 0 100 100">
                <path d="M50,10 L65,60 L55,60 L70,90 L35,40 L50,40 Z"
                    fill="none"
                    stroke="#2ee9fa"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow1)"
                />
                <defs>
                    <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
            {/* Neon lightning effect 2 */}
            <svg className="absolute right-[14%] top-[65%] w-16 h-16 opacity-45 mix-blend-lighten animate-lightning2"
                viewBox="0 0 100 100">
                <path d="M60,20 L75,70 L65,70 L80,90 L55,45 L65,45 Z"
                    fill="none"
                    stroke="#00ffd0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow2)"
                />
                <defs>
                    <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
