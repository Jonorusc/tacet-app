"use client";

import { use, useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { initClerk } from "tauri-plugin-clerk";

export default function ClerkTauriClient({ children }: { children: React.ReactNode }) {
    const [clerk, setClerk] = useState<any>(null);

    useEffect(() => {
        console.log("Starting Clerk initialization via tauri-plugin-clerk...");
        initClerk()
            .then((c) => {
                console.log("Clerk initialized success:", c);
                setClerk(c);
            })
            .catch((err) => {
                console.error("Clerk initialization failed:", err);
            });
    }, []);

    if (!clerk) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono text-sm">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Initializing Tacet Protocol (Client)...</span>
                </div>
            </div>
        );
    }

    return (
        <ClerkProvider publishableKey={clerk.publishableKey} Clerk={clerk}>
            {children}
        </ClerkProvider>
    );
}