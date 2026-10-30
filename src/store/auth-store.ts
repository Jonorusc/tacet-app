import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';
import type { User } from '@/src/types/tacet';

interface AuthState {
    user: User | null;
    authStatus: 'idle' | 'loading' | 'success' | 'error';
    errorMessage: string | null;

    // Actions
    verifyToken: (token: string) => Promise<void>;
    setUser: (user: User | null) => void;
    setAuthStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
    setErrorMessage: (message: string | null) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    authStatus: 'idle',
    errorMessage: null,

    verifyToken: async (token: string) => {
        set({ authStatus: 'loading', errorMessage: null });
        try {
            const user = await TacetClient.verifyClerkToken(token);
            set({ user, authStatus: 'success' });
        } catch (error) {
            set({
                authStatus: 'error',
                errorMessage: error instanceof Error ? error.message : 'Authentication failed',
            });
        }
    },

    setUser: (user) => set({ user }),
    setAuthStatus: (status) => set({ authStatus: status }),
    setErrorMessage: (message) => set({ errorMessage: message }),
    reset: () => set({ user: null, authStatus: 'idle', errorMessage: null }),
}));
