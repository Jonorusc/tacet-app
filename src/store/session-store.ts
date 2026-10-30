import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';
import type { FocusSession } from '@/src/types/tacet';

interface SessionStore {
    // State
    currentSession: FocusSession | null;
    sessionHistory: FocusSession[];
    isLoading: boolean;
    error: string | null;

    // Actions
    startSession: (userId: string) => Promise<void>;
    endSession: (sessionId: number) => Promise<void>;
    loadCurrentSession: (userId: string) => Promise<void>;
    loadSessionHistory: (userId: string, limit?: number) => Promise<void>;
    clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
    // Initial state
    currentSession: null,
    sessionHistory: [],
    isLoading: false,
    error: null,

    // Start a new focus session
    startSession: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const session = await TacetClient.startFocusSession(userId);
            set({ currentSession: session, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to start session',
                isLoading: false,
            });
        }
    },

    // End the current focus session
    endSession: async (sessionId: number) => {
        set({ isLoading: true, error: null });
        try {
            const session = await TacetClient.endFocusSession(sessionId);
            set({ currentSession: null, isLoading: false });

            // Refresh history
            const userId = session.user_id;
            await get().loadSessionHistory(userId);
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to end session',
                isLoading: false,
            });
        }
    },

    // Load the current active session
    loadCurrentSession: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const session = await TacetClient.getCurrentSession(userId);
            set({ currentSession: session, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load current session',
                isLoading: false,
            });
        }
    },

    // Load session history
    loadSessionHistory: async (userId: string, limit?: number) => {
        set({ isLoading: true, error: null });
        try {
            const sessionHistory = await TacetClient.getSessions(userId, limit);
            set({ sessionHistory, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load session history',
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
