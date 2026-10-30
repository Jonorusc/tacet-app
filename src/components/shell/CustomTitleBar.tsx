"use client";

import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus, Square, Copy } from "lucide-react";
import { motion } from "framer-motion";

export function CustomTitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);
    const userSubscriptionKind: 'null' | 'core' = 'null'

    // Get the window instance
    const appWindow = getCurrentWindow();

    useEffect(() => {
        const checkMaximized = async () => {
            setIsMaximized(await appWindow.isMaximized());
        };

        // Check initial state
        checkMaximized();

        // Listen for resize events to update state
        const unlisten = appWindow.listen("tauri://resize", checkMaximized);

        return () => {
            unlisten.then(f => f());
        }
    }, [appWindow]);

    const handleMinimize = () => appWindow.minimize();
    const handleMaximize = async () => {
        await appWindow.toggleMaximize();
        setIsMaximized(await appWindow.isMaximized());
    };
    const handleClose = () => appWindow.close();

    return (
        <div
            data-tauri-drag-region
            className="fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-4 z-50 select-none bg-void/80 backdrop-blur-md border-b border-white/5"
        >
            {/* Brand */}
            <div className=" pl-2 flex items-center gap-3 select-none">
                <div className="w-4 h-4 rounded-full bg-starlight/10 border border-starlight/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-starlight rounded-full shadow-[0_0_10px_white]" />
                </div>
                <span className="text-xs font-mono font-medium tracking-widest text-starlight uppercase">
                    Tacet {userSubscriptionKind}
                </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
                <ControlBtn onClick={handleMinimize}>
                    <Minus className="w-3.5 h-3.5" />
                </ControlBtn>

                <ControlBtn onClick={handleMaximize}>
                    {isMaximized ? (
                        <Copy className="w-3 h-3 rotate-180" />
                    ) : (
                        <Square className="w-3 h-3" />
                    )}
                </ControlBtn>

                <ControlBtn onClick={handleClose} isDanger>
                    <X className="w-4 h-4" />
                </ControlBtn>
            </div>
        </div>
    );
}

function ControlBtn({
    children,
    onClick,
    isDanger = false
}: {
    children: React.ReactNode;
    onClick: () => void;
    isDanger?: boolean;
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.1, backgroundColor: isDanger ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-colors
        ${isDanger ? "text-starlight hover:text-red-400" : "text-starlight/60 hover:text-starlight"}
      `}
        >
            {children}
        </motion.button>
    );
}
