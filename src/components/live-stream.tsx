"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, AlertCircle, CheckCircle, Shield, Radio, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSignalStore } from "@/src/store/signal-store";
import { useAuthStore } from "@/src/store/auth-store";
import type { Signal } from "@/src/types/tacet";

export function LiveStream() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user: clerkUser, isLoaded } = useUser();
    const authStoreUser = useAuthStore((state) => state.user);
    const { signals, isLoading, error, startPolling, stopPolling } = useSignalStore();

    // Use auth-store user ID if available, otherwise fall back to Clerk user ID
    const userId = authStoreUser?.id || clerkUser?.id;

    // Auto-scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [signals]);

    // Start polling when user is available
    useEffect(() => {
        if (userId && isLoaded) {
            startPolling(userId, 5000); // Poll every 5 seconds
            return () => stopPolling();
        }
    }, [userId, isLoaded, startPolling, stopPolling]);

    return (
        <div className="h-full flex flex-col border border-grid-line bg-void/40 backdrop-blur rounded overflow-hidden">
            <div className="h-10 border-b border-grid-line bg-void/80 flex items-center justify-between px-4">
                <span className="font-mono text-xs text-starlight/50 uppercase flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-signal-allow'} animate-pulse`} />
                    Live Output {signals.length > 0 && `(${signals.length})`}
                </span>
                <button className="text-starlight/30 hover:text-starlight transition-colors">
                    <Copy className="w-3 h-3" />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs"
            >
                {error && (
                    <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded border border-rose-500/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}

                {!clerkUser && isLoaded && (
                    <div className="flex items-center justify-center h-full text-starlight/30">
                        <span>Please sign in to view signals</span>
                    </div>
                )}

                {clerkUser && signals.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full text-starlight/30">
                        <span>No signals yet. Waiting for activity...</span>
                    </div>
                )}

                {isLoading && signals.length === 0 && (
                    <div className="flex items-center justify-center h-full text-starlight/30">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <AnimatePresence initial={false} mode="popLayout">
                        {signals.map((signal) => (
                            <SignalItem key={signal.id} signal={signal} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

import React from "react";

const SignalItem = React.memo(function SignalItem({ signal }: { signal: Signal }) {
    const getIcon = (action: string) => {
        switch (action) {
            case "BLOCKED": return <Shield className="w-3 h-3 text-signal-block" />;
            case "ALLOWED": return <CheckCircle className="w-3 h-3 text-signal-allow" />;
            default: return <Radio className="w-3 h-3 text-starlight/50" />;
        }
    };

    // Format timestamp
    const timestamp = new Date(signal.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 items-start group hover:bg-starlight/5 p-1 rounded transition-colors will-change-transform"
        >
            <span className="text-starlight/20 whitespace-nowrap select-none w-14">{timestamp}</span>
            <div className="mt-0.5 shrink-0">{getIcon(signal.action)}</div>
            <div className="flex-1 min-w-0">
                <span className={`mr-2 font-bold ${signal.action === "BLOCKED" ? "text-signal-block" :
                    signal.action === "ALLOWED" ? "text-signal-allow" :
                        "text-starlight/50"
                    }`}>
                    [{signal.action}]
                </span>
                <span className="text-starlight/70 truncate block md:inline">
                    <span className="text-starlight/40 mr-1">{signal.source_app}:</span>
                    {signal.content_snippet || signal.full_content || "No content"}
                </span>
            </div>
        </motion.div>
    )
});
