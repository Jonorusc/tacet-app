"use client";

import { CustomTitleBar } from "./CustomTitleBar";
import { motion, AnimatePresence } from "framer-motion";

interface WindowFrameProps {
    children: React.ReactNode;
    className?: string; // Allow extra styling hooks
}

export function WindowFrame({ children, className = "" }: WindowFrameProps) {
    return (
        <div className={`relative flex flex-col h-screen w-screen overflow-hidden bg-void text-starlight selection:bg-starlight selection:text-void font-sans ${className}`}>
            {/* Global Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),rgba(0,0,0,0))]" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay" />

            {/* Custom Shell */}
            <CustomTitleBar />

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 pt-10 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                    {children}
                </AnimatePresence>
            </main>

            {/* Decorative Border / Glow */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-lg" />
        </div>
    );
}
