use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub subscription_plan: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserPreferences {
    pub user_id: String,
    pub focus_mode_enabled: bool,
    pub ai_confidence_threshold: i32,
    pub allowed_apps: Option<String>, // JSON array as string
    pub blocked_apps: Option<String>, // JSON array as string
    pub custom_rules: Option<String>, // JSON object as string
    pub ollama_model: String,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FocusSession {
    pub id: i64,
    pub user_id: String,
    pub started_at: i64,
    pub ended_at: Option<i64>,
    pub duration_seconds: Option<i64>,
    pub signals_blocked: i32,
    pub signals_allowed: i32,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Signal {
    pub id: i64,
    pub user_id: String,
    pub session_id: Option<i64>,
    pub source_app: String,
    pub content_snippet: Option<String>,
    pub full_content: Option<String>,
    pub action: String, // "ALLOWED" or "BLOCKED"
    pub confidence_score: Option<i32>,
    pub ai_reasoning: Option<String>,
    pub timestamp: i64,
    pub created_at: i64,
}

// Input types for creating records
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUser {
    pub id: String,
    pub email: String,
    pub subscription_plan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserPreferences {
    pub focus_mode_enabled: Option<bool>,
    pub ai_confidence_threshold: Option<i32>,
    pub allowed_apps: Option<Vec<String>>,
    pub blocked_apps: Option<Vec<String>>,
    pub custom_rules: Option<serde_json::Value>,
    pub ollama_model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSignal {
    pub user_id: String,
    pub session_id: Option<i64>,
    pub source_app: String,
    pub content_snippet: Option<String>,
    pub full_content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterDecision {
    pub action: String, // "ALLOW" or "BLOCK"
    pub confidence: i32,
    pub reasoning: String,
}

// Stats types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_focus_time: i64, // in seconds
    pub signals_blocked: i32,
    pub signals_allowed: i32,
    pub efficiency: f64, // percentage
    pub current_session: Option<FocusSession>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalStats {
    pub total_signals: i32,
    pub blocked: i32,
    pub allowed: i32,
    pub block_rate: f64,
}
