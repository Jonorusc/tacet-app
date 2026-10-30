import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';
import type { Signal, CreateSignal, SignalStats } from '@/src/types/tacet';

interface SignalStore {
    // State
    signals: Signal[];
    stats: SignalStats | null;
    isLoading: boolean;
    error: string | null;
    isPolling: boolean;

    // Actions
    loadSignals: (userId: string, limit?: number, offset?: number) => Promise<void>;
    loadStats: (userId: string) => Promise<void>;
    processAndLogSignal: (signal: CreateSignal) => Promise<void>;
    startPolling: (userId: string, intervalMs?: number) => void;
    stopPolling: () => void;
    clearError: () => void;
}

export const useSignalStore = create<SignalStore>((set, get) => {
    let pollingInterval: NodeJS.Timeout | null = null;

    return {
        // Initial state
        signals: [],
        stats: null,
        isLoading: false,
        error: null,
        isPolling: false,

        // Load signals from backend
        loadSignals: async (userId: string, limit?: number, offset?: number) => {
            set({ isLoading: true, error: null });
            try {
                const signals = await TacetClient.getSignals(userId, limit, offset);
                set({ signals, isLoading: false });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load signals',
                    isLoading: false,
                });
            }
        },

        // Load signal statistics
        loadStats: async (userId: string) => {
            set({ isLoading: true, error: null });
            try {
                const stats = await TacetClient.getSignalStats(userId);
                set({ stats, isLoading: false });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load stats',
                    isLoading: false,
                });
            }
        },

        // Process a signal through AI and log it
        processAndLogSignal: async (signal: CreateSignal) => {
            set({ isLoading: true, error: null });
            try {
                // Process through AI/rules
                const decision = await TacetClient.processSignal(signal);

                // Signal is already logged by process_signal command
                // Just refresh the signals list
                const { signals } = get();
                await get().loadSignals(signal.user_id);

                set({ isLoading: false });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to process signal',
                    isLoading: false,
                });
            }
        },

        // Start polling for new signals
        startPolling: (userId: string, intervalMs: number = 5000) => {
            const state = get();
            if (state.isPolling) return;

            set({ isPolling: true });

            // Initial load
            get().loadSignals(userId);

            // Poll for updates
            pollingInterval = setInterval(() => {
                get().loadSignals(userId);
            }, intervalMs);
        },

        // Stop polling
        stopPolling: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            set({ isPolling: false });
        },

        // Clear error
        clearError: () => set({ error: null }),
    };
});

