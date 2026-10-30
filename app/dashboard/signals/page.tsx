'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/auth-store';
import { useSignalStore } from '@/src/store/signal-store';
import { formatTimestamp } from '@/src/lib/utils';

import type { Signal } from '@/src/types/tacet';

export default function SignalsPage() {
    const user = useAuthStore((state) => state.user);
    const { signals, stats, isLoading, loadSignals, loadStats } = useSignalStore();
    const [filter, setFilter] = useState<'all' | 'allowed' | 'blocked'>('all');

    // Load signals and stats when user is available
    useEffect(() => {
        if (user?.id) {
            loadSignals(user.id);
            loadStats(user.id);
        }
    }, [user?.id, loadSignals, loadStats]);

    // Filter signals based on selected filter
    const filteredSignals = signals.filter((signal) => {
        if (filter === 'all') return true;
        if (filter === 'allowed') return signal.action === 'ALLOWED';
        if (filter === 'blocked') return signal.action === 'BLOCKED';
        return true;
    });


    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Signal History</h1>
                <p className="text-white/60">
                    All notifications processed by Tacet
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-grid-line/50 rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Total Signals</div>
                        <div className="text-2xl font-bold text-white">
                            {stats.total_signals}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-grid-line/50 rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Blocked</div>
                        <div className="text-2xl font-bold text-signal-block">
                            {stats.blocked}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-grid-line/50 rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Allowed</div>
                        <div className="text-2xl font-bold text-signal-allow">
                            {stats.allowed}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('blocked')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'blocked'
                        ? 'bg-signal-block/20 text-signal-block border border-signal-block/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Blocked
                </button>
                <button
                    onClick={() => setFilter('allowed')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'allowed'
                        ? 'bg-signal-allow/20 text-signal-allow border border-signal-allow/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Allowed
                </button>
            </div>

            {/* Signals List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-white/60">Loading signals...</div>
                    </div>
                ) : filteredSignals.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-white/60 mb-2">No signals yet</div>
                            <div className="text-white/40 text-sm">
                                Signals will appear here as they are processed
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredSignals.map((signal) => (
                        <SignalCard key={signal.id} signal={signal} formatTimestamp={formatTimestamp} />
                    ))
                )}
            </div>
        </div>
    );
}

// Signal Card Component
function SignalCard({
    signal,
    formatTimestamp,
}: {
    signal: Signal;
    formatTimestamp: (timestamp: number) => string;
}) {
    const isBlocked = signal.action === 'BLOCKED';

    return (
        <div
            className={`border rounded-xl p-4 transition-colors ${isBlocked
                ? 'border-signal-block/30 bg-signal-block/5'
                : 'border-signal-allow/30 bg-signal-allow/5'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div
                        className={`px-2 py-1 rounded text-xs font-medium ${isBlocked
                            ? 'bg-signal-block/20 text-signal-block'
                            : 'bg-signal-allow/20 text-signal-allow'
                            }`}
                    >
                        {signal.action}
                    </div>
                    <div className="text-white font-medium">{signal.source_app}</div>
                </div>
                <div className="text-white/40 text-sm">
                    {formatTimestamp(signal.timestamp)}
                </div>
            </div>

            {signal.content_snippet && (
                <div className="text-white/70 text-sm mb-2">
                    {signal.content_snippet}
                </div>
            )}

            {signal.ai_reasoning && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/10">
                    <div className="text-white/40 text-xs">AI:</div>
                    <div className="text-white/60 text-xs flex-1">
                        {signal.ai_reasoning}
                    </div>
                    {signal.confidence_score && (
                        <div className="text-white/40 text-xs">
                            {signal.confidence_score}%
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
