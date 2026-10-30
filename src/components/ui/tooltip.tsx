"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    side?: "right" | "top" | "bottom" | "left";
    offset?: number;
    delay?: number;
}

export function Tooltip({ text, children, side = "right", offset = 10, delay = 0.2 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay * 1000);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    // Position logic
    const positionStyles = {
        right: { left: "100%", top: "50%", marginLeft: offset, translateY: "-50%" },
        left: { right: "100%", top: "50%", marginRight: offset, translateY: "-50%" },
        top: { bottom: "100%", left: "50%", marginBottom: offset, translateX: "-50%" },
        bottom: { top: "100%", left: "50%", marginTop: offset, translateX: "-50%" },
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, ...positionStyles[side] }}
                        animate={{ opacity: 1, scale: 1, ...positionStyles[side] }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 px-3 py-1.5 text-xs font-mono font-medium text-void bg-starlight rounded shadow-lg whitespace-nowrap pointer-events-none"
                    >
                        {text}
                        {/* Little arrow if needed, but clean rect is fine for this aesthetic */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
