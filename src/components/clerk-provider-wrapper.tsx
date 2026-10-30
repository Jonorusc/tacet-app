"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ClerkTauriClient = dynamic(
    () => import("./clerk-provider-client"),
    { ssr: false }
);


export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono text-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-white">Initializing Tacet Protocol...</span>
                    </div>
                </div>
            }>

                <ClerkTauriClient>
                    {children}
                </ClerkTauriClient>
            </Suspense>
        </>
    );
}