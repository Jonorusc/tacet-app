"use client";

import Link from "next/link";
import { Shield, Radio, Sliders, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: Shield, label: "Shield", href: "/dashboard" },
    { icon: Radio, label: "Signals", href: "/dashboard/signals" },
    { icon: Sliders, label: "Tuning", href: "/dashboard/tuning" },
    { icon: Settings, label: "System", href: "/dashboard/system" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-16 md:w-64 h-screen border-r border-grid-line bg-void/50 backdrop-blur-xl flex flex-col justify-between p-4 z-50 relative">
            <div>
                {/* Brand */}
                <div className="mb-12 pl-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-starlight/10 border border-starlight/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-starlight rounded-full shadow-[0_0_10px_white]" />
                    </div>
                    <span className="hidden md:block font-display font-bold tracking-tight text-xl">
                        TACET
                    </span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`w-full flex items-center gap-3 p-3 rounded-md transition-all duration-300 group ${isActive
                                    ? "bg-starlight/5 text-starlight border border-starlight/10"
                                    : "text-starlight/40 hover:text-starlight hover:bg-starlight/5"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="hidden md:block font-mono text-sm tracking-widest uppercase">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-signal-allow shadow-[0_0_8px_var(--signal-allow)] hidden md:block" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-grid-line pt-4">
                <button className="w-full flex items-center gap-3 p-3 text-starlight/40 hover:text-rose-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:block font-mono text-xs">DISCONNECT</span>
                </button>
                <div className="mt-4 hidden md:block">
                    <p className="font-mono text-[10px] text-starlight/20">
                        V. 0.9.1 [BETA]
                    </p>
                    <p className="font-mono text-[10px] text-starlight/20">
                        SYSTEM ONLINE
                    </p>
                </div>
            </div>
        </aside>
    );
}
