"use client";

import { useUser, useClerk } from "@clerk/clerk-react";
import Image from "next/image";
import { openUrl } from "@tauri-apps/plugin-opener";
import { LogOut, CreditCard, Lock, ShieldCheck, Activity, Settings } from "lucide-react";
import { motion } from "framer-motion";

export function UserProfileModule() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();

    if (!isLoaded || !user) return null;

    const handleOpenLink = async (url: string) => {
        try {
            await openUrl(url);
        } catch (error) {
            console.error("Failed to open link:", error);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        // State change will be handled by the parent effect observing user state
    };

    return (
        <div className="w-full max-w-md p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-starlight/20">
                        <Image
                            src={user.imageUrl}
                            alt={user.fullName || "User"}
                            width={64}
                            height={64}
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-signal-allow border-2 border-void flex items-center justify-center">
                        <Activity className="w-2 h-2 text-void animate-pulse" />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-display font-medium text-starlight">
                        {user.username || "Operative"}
                    </h2>
                    <p className="text-sm font-mono text-white/40">
                        Email: {user.primaryEmailAddress?.emailAddress}
                    </p>
                </div>
            </div>

            {/* Stats/Status Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center text-center">
                    <ShieldCheck className="w-5 h-5 text-starlight/60 mb-1" />
                    <span className="text-xs text-white/40 uppercase tracking-widest">Clearance</span>
                    <span className="text-sm font-bold text-starlight">Level 3</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center text-center">
                    <Activity className="w-5 h-5 text-signal-allow/60 mb-1" />
                    <span className="text-xs text-white/40 uppercase tracking-widest">Status</span>
                    <span className="text-sm font-bold text-signal-allow">Active</span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <ActionBtn
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Manage Subscription"
                    onClick={() => handleOpenLink("https://tacet.pro/account")}
                />
                <ActionBtn
                    icon={<Lock className="w-4 h-4" />}
                    label="Update Security Keys"
                    onClick={() => handleOpenLink("https://tacet.pro/security")}
                />

                <div className="h-px bg-white/5 my-2" />

                {/* Settings */}
                <ActionBtn
                    icon={<Settings className="w-4 h-4" />}
                    label="Settings"
                    onClick={() => handleOpenLink("https://tacet.pro/settings")}
                />

                <div className="h-px bg-white/5 my-2" />
                {/*  */}
                <ActionBtn
                    icon={<LogOut className="w-4 h-4" />}
                    label="Terminate Session"
                    onClick={handleSignOut}
                    isDanger
                />
            </div>
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    onClick,
    isDanger = false
}: {
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    isDanger?: boolean
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-sm font-medium
                ${isDanger
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-200 hover:bg-rose-500/20 hover:border-rose-500/40"
                    : "bg-white/5 border-white/5 text-starlight/80 hover:bg-white/10 hover:border-white/10 hover:text-starlight"
                }
            `}
        >
            {icon}
            {label}
        </motion.button>
    )
}
