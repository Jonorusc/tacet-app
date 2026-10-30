"use client";

import { Sidebar } from "@/src/components/shell/Sidebar";
import { NoiseOverlay } from "@/src/components/ui/noise-overlay";
import { UserProfileModal } from "@/src/components/user/UserProfileModal";
import { CustomTitleBar } from "@/src/components/shell/CustomTitleBar";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    return (
        <div className="h-screen bg-void flex overflow-hidden pt-10">
            <CustomTitleBar />
            <Sidebar onProfileClick={() => setIsProfileOpen(true)} />
            <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">


                {/* Content */}
                <div className="flex-1 overflow-auto p-6 md:p-12 relative">
                    {/* Grid Background Effect */}
                    <div
                        className="absolute inset-0 z-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div className="relative z-10 h-full">
                        {children}
                    </div>
                </div>
            </main>

            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
}
