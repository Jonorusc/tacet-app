import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';
import type {
    UserPreferences,
    UpdateUserPreferences,
    ParsedPreferences,
} from '@/src/types/tacet';
import { parsePreferences, formatPreferences } from '@/src/types/tacet';

interface PreferencesStore {
    // State
    preferences: ParsedPreferences | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadPreferences: (userId: string) => Promise<void>;
    updatePreferences: (
        userId: string,
        updates: Partial<ParsedPreferences>
    ) => Promise<void>;
    toggleFocusMode: (userId: string) => Promise<void>;
    clearError: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
    // Initial state
    preferences: null,
    isLoading: false,
    error: null,

    // Load user preferences
    loadPreferences: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const rawPrefs = await TacetClient.getPreferences(userId);
            const preferences = parsePreferences(rawPrefs);
            set({ preferences, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load preferences',
                isLoading: false,
            });
        }
    },

    // Update user preferences
    updatePreferences: async (
        userId: string,
        updates: Partial<ParsedPreferences>
    ) => {
        set({ isLoading: true, error: null });
        try {
            const formattedUpdates = formatPreferences(updates);
            const rawPrefs = await TacetClient.updatePreferences(userId, formattedUpdates);
            const preferences = parsePreferences(rawPrefs);
            set({ preferences, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update preferences',
                isLoading: false,
            });
        }
    },

    // Toggle focus mode on/off
    toggleFocusMode: async (userId: string) => {
        const { preferences } = get();
        if (!preferences) return;

        await get().updatePreferences(userId, {
            focus_mode_enabled: !preferences.focus_mode_enabled,
        });
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
