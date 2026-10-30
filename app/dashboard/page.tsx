'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { StatusRing } from '@/src/components/status-ring';
import { LiveStream } from '@/src/components/live-stream';
import { useAuthStore } from '@/src/store/auth-store';
import { useStatsStore } from '@/src/store/stats-store';
import { useSessionStore } from '@/src/store/session-store';

export default function DashboardPage() {
    const { user: clerkUser } = useUser();
    const user = useAuthStore((state) => state.user);
    const dashboardStats = useStatsStore((state) => state.dashboardStats);
    const loadDashboardStats = useStatsStore((state) => state.loadDashboardStats);
    const loadCurrentSession = useSessionStore((state) => state.loadCurrentSession);

    // Load data when user is available
    useEffect(() => {
        if (user?.id) {
            loadDashboardStats(user.id);
            loadCurrentSession(user.id);
        }
    }, [user?.id, loadDashboardStats, loadCurrentSession]);

    // Format time from seconds to HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Use real data or fallback to placeholders
    const focusTime = dashboardStats
        ? formatTime(dashboardStats.total_focus_time)
        : '--:--:--';
    const signalsBlocked = dashboardStats?.signals_blocked.toString() ?? '--';
    const signalsAllowed = dashboardStats?.signals_allowed.toString() ?? '--';
    const efficiency = dashboardStats
        ? `${Math.round(dashboardStats.efficiency)}%`
        : '--%';

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Control Area */}
            <div className="lg:col-span-8 flex flex-col">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Focus Time" value={focusTime} />
                    <StatCard
                        label="Signals Blocked"
                        value={signalsBlocked}
                        valueColor="text-signal-block"
                    />
                    <StatCard
                        label="Allowed"
                        value={signalsAllowed}
                        valueColor="text-signal-allow"
                    />
                    <StatCard label="Efficiency" value={efficiency} />
                </div>

                {/* Center Ring */}
                <div className="flex-1 flex items-center justify-center border border-grid-line/50 rounded-2xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                    <StatusRing />
                </div>
            </div>

            {/* Side Panel (Stream) */}
            <div className="lg:col-span-4 h-[400px] lg:h-auto">
                <LiveStream />
            </div>
        </div>
    );
}
