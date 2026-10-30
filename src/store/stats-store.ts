import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';
import type { DashboardStats, TrendData } from '@/src/types/tacet';

interface StatsStore {
    // State
    dashboardStats: DashboardStats | null;
    trends: TrendData | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadDashboardStats: (userId: string) => Promise<void>;
    loadTrends: (userId: string, period: 'day' | 'week' | 'month') => Promise<void>;
    clearError: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
    // Initial state
    dashboardStats: null,
    trends: null,
    isLoading: false,
    error: null,

    // Load dashboard statistics
    loadDashboardStats: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const dashboardStats = await TacetClient.getDashboardStats(userId);
            set({ dashboardStats, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load dashboard stats',
                isLoading: false,
            });
        }
    },

    // Load trend data
    loadTrends: async (userId: string, period: 'day' | 'week' | 'month') => {
        set({ isLoading: true, error: null });
        try {
            const trends = await TacetClient.getTrends(userId, period);
            set({ trends, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load trends',
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
