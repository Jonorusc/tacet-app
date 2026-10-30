import { invoke } from '@tauri-apps/api/core';
import type {
    User,
    UserPreferences,
    FocusSession,
    Signal,
    CreateSignal,
    UpdateUserPreferences,
    FilterDecision,
    DashboardStats,
    SignalStats,
    SubscriptionInfo,
    TrendData,
} from '@/src/types/tacet';

/**
 * TacetClient - Type-safe wrapper for Tauri backend commands
 * All methods return Promises and handle errors consistently
 */
export class TacetClient {
    // ============================================================================
    // Auth Commands
    // ============================================================================

    /**
     * Verify Clerk JWT token and sync user to local database
     */
    static async verifyClerkToken(token: string): Promise<User> {
        return invoke<User>('verify_clerk_token', { token });
    }

    /**
     * Get user subscription information from Clerk
     */
    static async getUserSubscription(userId: string): Promise<SubscriptionInfo> {
        return invoke<SubscriptionInfo>('get_user_subscription', { userId });
    }

    /**
     * Sync user data (subscription status) from Clerk
     */
    static async syncUserData(userId: string): Promise<void> {
        return invoke<void>('sync_user_data', { userId });
    }

    // ============================================================================
    // Signal Commands
    // ============================================================================

    /**
     * Log a signal (notification) to the database
     */
    static async logSignal(
        signal: CreateSignal,
        decision: FilterDecision
    ): Promise<Signal> {
        return invoke<Signal>('log_signal', { signal, decision });
    }

    /**
     * Get signal history with pagination
     */
    static async getSignals(
        userId: string,
        limit?: number,
        offset?: number
    ): Promise<Signal[]> {
        return invoke<Signal[]>('get_signals', {
            userId,
            limit: limit ?? 50,
            offset: offset ?? 0,
        });
    }

    /**
     * Process a signal through AI filter (or rule-based fallback)
     */
    static async processSignal(signal: CreateSignal): Promise<FilterDecision> {
        return invoke<FilterDecision>('process_signal', { signal });
    }

    /**
     * Get signal statistics for a user
     */
    static async getSignalStats(userId: string): Promise<SignalStats> {
        return invoke<SignalStats>('get_signal_stats', { userId });
    }

    // ============================================================================
    // Session Commands
    // ============================================================================

    /**
     * Start a new focus session
     */
    static async startFocusSession(userId: string): Promise<FocusSession> {
        return invoke<FocusSession>('start_focus_session', { userId });
    }

    /**
     * End a focus session
     */
    static async endFocusSession(sessionId: number): Promise<FocusSession> {
        return invoke<FocusSession>('end_focus_session', { sessionId });
    }

    /**
     * Get session history
     */
    static async getSessions(
        userId: string,
        limit?: number
    ): Promise<FocusSession[]> {
        return invoke<FocusSession[]>('get_sessions', {
            userId,
            limit: limit ?? 20,
        });
    }

    /**
     * Get the current active session
     */
    static async getCurrentSession(
        userId: string
    ): Promise<FocusSession | null> {
        return invoke<FocusSession | null>('get_current_session', { userId });
    }

    // ============================================================================
    // Stats Commands
    // ============================================================================

    /**
     * Get dashboard statistics
     */
    static async getDashboardStats(userId: string): Promise<DashboardStats> {
        return invoke<DashboardStats>('get_dashboard_stats', { userId });
    }

    /**
     * Get trend data for a specific period
     */
    static async getTrends(
        userId: string,
        period: 'day' | 'week' | 'month'
    ): Promise<TrendData> {
        return invoke<TrendData>('get_trends', { userId, period });
    }

    // ============================================================================
    // Preferences Commands
    // ============================================================================

    /**
     * Get user preferences (creates defaults if missing)
     */
    static async getPreferences(userId: string): Promise<UserPreferences> {
        return invoke<UserPreferences>('get_preferences', { userId });
    }

    /**
     * Update user preferences
     */
    static async updatePreferences(
        userId: string,
        preferences: UpdateUserPreferences
    ): Promise<UserPreferences> {
        return invoke<UserPreferences>('update_preferences', {
            userId,
            preferences,
        });
    }

    // ============================================================================
    // AI Commands
    // ============================================================================

    /**
     * Check if Ollama is available
     */
    static async checkOllamaAvailable(): Promise<boolean> {
        return invoke<boolean>('check_ollama_available');
    }

    /**
     * List available Ollama models
     */
    static async listOllamaModels(): Promise<string[]> {
        return invoke<string[]>('list_ollama_models');
    }

    /**
     * Load an Ollama model (warm it up)
     */
    static async loadOllamaModel(model: string): Promise<void> {
        return invoke<void>('load_ollama_model', { model });
    }

    /**
     * Unload Ollama model (free memory)
     */
    static async unloadOllamaModel(): Promise<void> {
        return invoke<void>('unload_ollama_model');
    }

    /**
     * Test Ollama with a simple prompt
     */
    static async testOllama(model: string): Promise<string> {
        return invoke<string>('test_ollama', { model });
    }
}
