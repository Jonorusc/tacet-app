"use client";

import { useState } from "react";
import { Sidebar } from "../shell/Sidebar";
import { UserProfileModal } from "../user/UserProfileModal";
import { DashboardHome } from "./DashboardHome";
import { SystemView } from "./SystemView";
import { TuningTerminal } from "../tuning-terminal"; // Assuming existing
import { LiveStream } from "../live-stream"; // Assuming existing

export function DashboardLayout() {
    const [activeView, setActiveView] = useState<'shield' | 'signals' | 'tuning' | 'system'>('shield');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case 'shield': return <DashboardHome />;
            case 'signals': return <LiveStream />; // Using LiveStream for Signals
            case 'tuning': return <TuningTerminal />;
            case 'system': return <SystemView />;
            default: return <DashboardHome />;
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
                activeView={activeView}
                onNavigate={setActiveView}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {renderContent()}
            </div>

            {/* Profile Modal Overlay */}
            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
}
