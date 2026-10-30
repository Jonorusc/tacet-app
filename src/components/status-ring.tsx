"use client";

import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useState } from "react";

interface StatusRingProps {
    status?: "active" | "inactive";
}

export function StatusRing({ status }: StatusRingProps) {
    const [localActive, setLocalActive] = useState(status === "inactive" ? false : true);
    const active = status !== undefined ? status === "active" : localActive;
    const setActive = setLocalActive;


    return (
        <div className="relative flex flex-col items-center justify-center py-12 md:py-20">
            {/* Outer Rotating Ring */}
            <motion.div
                animate={{ rotate: active ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-dashed transition-colors duration-700 will-change-transform ${active ? "border-starlight/20" : "border-starlight/5"
                    }`}
            />

            {/* Inner Pulse Ring */}
            <div className="relative">
                <motion.div
                    animate={{
                        scale: active ? [1, 1.05, 1] : 1,
                        opacity: active ? [0.1, 0.3, 0.1] : 0,
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-700 will-change-transform ${active ? "bg-starlight" : "bg-transparent"
                        }`}
                />

                {/* Main Interface Button */}
                <button
                    onClick={() => setActive(!active)}
                    className={`relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center gap-4 border-2 transition-all duration-500 group overflow-hidden bg-void ${active
                        ? "border-starlight shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                        : "border-starlight/10 hover:border-starlight/30"
                        }`}
                >
                    {/* Scanline Effect */}
                    {active && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-starlight/5 to-transparent h-[10px] w-full animate-scan" />
                    )}

                    <Power
                        className={`w-12 h-12 transition-all duration-500 ${active
                            ? "text-starlight drop-shadow-[0_0_15px_white]"
                            : "text-starlight/20"
                            }`}
                    />
                    <div className="text-center space-y-1">
                        <span
                            className={`block font-mono text-sm tracking-[0.2em] transition-colors duration-300 ${active ? "text-starlight" : "text-starlight/40"
                                }`}
                        >
                            {active ? "SHIELD ACTIVE" : "SYSTEM IDLE"}
                        </span>
                        <span className="block font-mono text-[10px] text-starlight/30">
                            {active ? "BLOCKING NOISE" : "PASSIVE MONITORING"}
                        </span>
                    </div>
                </button>
            </div>

        </div>
    );
}
