"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Radio, Sliders, Settings, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import Image from "next/image";
import { useState } from "react";
import { Tooltip } from "@/src/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { icon: Shield, label: "Shield", href: "/dashboard" },
    { icon: Radio, label: "Signals", href: "/dashboard/signals" },
    { icon: Sliders, label: "Tuning", href: "/dashboard/tuning" },
    { icon: Settings, label: "System", href: "/dashboard/system" },
] as const;

interface SidebarProps {
    onProfileClick: () => void;
}

export function Sidebar({ onProfileClick }: SidebarProps) {
    const { user } = useUser();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <aside
            className={`
                h-full border-r border-white/5 bg-void/50 backdrop-blur-xl flex flex-col justify-between p-4 z-50 relative shrink-0 transition-all duration-300 ease-in-out
                ${isCollapsed ? "w-20" : "w-64"}
            `}
        >
            <div>
                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        const LinkContent = (
                            <Link
                                href={item.href}
                                className={`
                                    flex items-center gap-3 p-3 rounded-md transition-all duration-300 group border-transparent border
                                    ${isActive
                                        ? "bg-starlight/5 text-starlight border border-starlight/10"
                                        : "text-starlight/40 hover:text-starlight hover:bg-starlight/5"
                                    }
                                    ${isCollapsed ? "justify-center" : ""}
                                `}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />

                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-mono text-sm tracking-widest uppercase text-left whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto w-1 h-1 rounded-full bg-signal-allow shadow-[0_0_8px_var(--signal-allow)]"
                                    />
                                )}
                            </Link>
                        );

                        return isCollapsed ? (
                            <Tooltip key={item.href} text={item.label} side="right">
                                {LinkContent}
                            </Tooltip>
                        ) : (
                            <div key={item.href}>{LinkContent}</div>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / Profile */}
            <div className={`border-t border-white/5 pt-4 space-y-4 ${isCollapsed ? "flex flex-col items-center" : ""}`}>

                {/* Collapse Toggle */}
                <div className={`flex w-full ${isCollapsed ? "justify-center" : "justify-end absolute bottom-22 -right-3"} `}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-md text-starlight/40 hover:text-starlight hover:bg-white/5 transition-colors border border-white/5 bg-void z-100"
                    >
                        {isCollapsed ? (
                            <div className="flex items-center gap-1">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <ChevronLeft className="w-4 h-4" />
                            </div>
                        )}
                    </button>
                </div>

                {/* Profile Trigger */}
                <Tooltip text={isCollapsed ? (user?.username || "Profile") : "Profile"} side="right">
                    <button
                        onClick={onProfileClick}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group text-left ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-starlight/30 transition-colors bg-white/5 shrink-0">
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-starlight/10" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="hidden md:block overflow-hidden transition-all duration-300">
                                <p className="text-xs font-medium text-starlight truncate">{user?.username || "Operative"}</p>
                                <p className="text-[10px] text-white/40 font-mono truncate">Email: {user?.emailAddresses[0].emailAddress || "Unknown"}</p>
                            </div>
                        )}
                    </button>
                </Tooltip>

                {!isCollapsed && (
                    <div className="hidden md:block px-2">
                        <div className="flex items-center justify-between text-[10px] text-starlight/20 font-mono">
                            <span>V. 0.9.1 [BETA]</span>
                            <span>ONLINE</span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
