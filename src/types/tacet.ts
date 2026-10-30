// ============================================================================
// Database Models (matching Rust types)
// ============================================================================

export interface User {
    id: string;
    email: string;
    subscription_plan: string;
    created_at: number;
    updated_at: number;
}

export interface UserPreferences {
    user_id: string;
    focus_mode_enabled: boolean;
    ai_confidence_threshold: number;
    allowed_apps: string | null; // JSON string
    blocked_apps: string | null; // JSON string
    custom_rules: string | null; // JSON string
    ollama_model: string;
    updated_at: number;
}

export interface FocusSession {
    id: number;
    user_id: string;
    started_at: number;
    ended_at: number | null;
    duration_seconds: number | null;
    signals_blocked: number;
    signals_allowed: number;
    created_at: number;
}

export interface Signal {
    id: number;
    user_id: string;
    session_id: number | null;
    source_app: string;
    content_snippet: string | null;
    full_content: string | null;
    action: 'ALLOWED' | 'BLOCKED';
    confidence_score: number | null;
    ai_reasoning: string | null;
    timestamp: number;
    created_at: number;
}

// ============================================================================
// Input Types (for creating records)
// ============================================================================

export interface CreateSignal {
    user_id: string;
    session_id: number | null;
    source_app: string;
    content_snippet: string | null;
    full_content: string | null;
}

export interface UpdateUserPreferences {
    focus_mode_enabled?: boolean;
    ai_confidence_threshold?: number;
    allowed_apps?: string[];
    blocked_apps?: string[];
    custom_rules?: Record<string, any>;
    ollama_model?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface FilterDecision {
    action: 'ALLOW' | 'BLOCK';
    confidence: number;
    reasoning: string;
}

export interface DashboardStats {
    total_focus_time: number; // in seconds
    signals_blocked: number;
    signals_allowed: number;
    efficiency: number; // percentage
    current_session: FocusSession | null;
}

export interface SignalStats {
    total_signals: number;
    blocked: number;
    allowed: number;
    block_rate: number;
}

export interface SubscriptionInfo {
    plan: string;
    features: string[];
}

export interface TrendData {
    period: string;
    daily_data: DailyTrend[];
}

export interface DailyTrend {
    date: number;
    focus_time: number;
    signals_blocked: number;
    signals_allowed: number;
    sessions_count: number;
}

// ============================================================================
// Parsed Preferences (for easier frontend use)
// ============================================================================

export interface ParsedPreferences {
    user_id: string;
    focus_mode_enabled: boolean;
    ai_confidence_threshold: number;
    allowed_apps: string[];
    blocked_apps: string[];
    custom_rules: Record<string, any>;
    ollama_model: string;
    updated_at: number;
}

// Helper to parse preferences
export function parsePreferences(prefs: UserPreferences): ParsedPreferences {
    return {
        user_id: prefs.user_id,
        focus_mode_enabled: prefs.focus_mode_enabled,
        ai_confidence_threshold: prefs.ai_confidence_threshold,
        allowed_apps: prefs.allowed_apps ? JSON.parse(prefs.allowed_apps) : [],
        blocked_apps: prefs.blocked_apps ? JSON.parse(prefs.blocked_apps) : [],
        custom_rules: prefs.custom_rules ? JSON.parse(prefs.custom_rules) : {},
        ollama_model: prefs.ollama_model,
        updated_at: prefs.updated_at,
    };
}

// Helper to format preferences for backend
export function formatPreferences(
    prefs: Partial<ParsedPreferences>
): UpdateUserPreferences {
    return {
        focus_mode_enabled: prefs.focus_mode_enabled,
        ai_confidence_threshold: prefs.ai_confidence_threshold,
        allowed_apps: prefs.allowed_apps,
        blocked_apps: prefs.blocked_apps,
        custom_rules: prefs.custom_rules,
        ollama_model: prefs.ollama_model,
    };
}
