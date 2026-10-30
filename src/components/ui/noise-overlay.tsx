"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function NoiseOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const animate = () => {
            time += 0.005;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            // Constant visible amplitude
            const currentAmpScale = 0.5; // Adjusted for subtle constant visibility
            const currentVisibility = 0.3; // Adjusted for subtle opacity

            // Draw multiple waves for a "sound" effect
            const lines = 3;
            ctx.lineWidth = 1.5;

            for (let i = 0; i < lines; i++) {
                ctx.beginPath();
                const baseOpacity = 0.2 - (i * 0.05);
                const fadeFactor = 1;
                const finalOpacity = baseOpacity * fadeFactor;

                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(finalOpacity, 0)})`;
                ctx.globalAlpha = currentVisibility;

                for (let x = 0; x < width; x += 5) {
                    // Complex wave function
                    // f(x) = sin(x * freq + time) * amplitude
                    const freq = 0.002 + (i * 0.001);
                    const y = centerY +
                        Math.sin(x * freq + time + (i * 2)) *
                        (100 * currentAmpScale) *
                        Math.sin(x * 0.001 + time * 0.5);

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        >
            {/* Sound Wave Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full mix-blend-overlay opacity-50" />
        </motion.div>
    );
}
