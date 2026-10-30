use super::models::*;
use sqlx::{Pool, Sqlite};

// ============================================================================
// User Queries
// ============================================================================

pub async fn upsert_user(pool: &Pool<Sqlite>, user: &CreateUser) -> Result<User, String> {
    let now = chrono::Utc::now().timestamp();
    let plan = user.subscription_plan.clone().unwrap_or_else(|| "free".to_string());

    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (id, email, subscription_plan, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            email = excluded.email,
            subscription_plan = excluded.subscription_plan,
            updated_at = excluded.updated_at
        RETURNING *
        "#,
    )
    .bind(&user.id)
    .bind(&user.email)
    .bind(&plan)
    .bind(now)
    .bind(now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to upsert user: {}", e))
}

pub async fn get_user(pool: &Pool<Sqlite>, user_id: &str) -> Result<Option<User>, String> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Failed to get user: {}", e))
}

// ============================================================================
// User Preferences Queries
// ============================================================================

pub async fn get_preferences(pool: &Pool<Sqlite>, user_id: &str) -> Result<Option<UserPreferences>, String> {
    let result = sqlx::query_as::<_, UserPreferences>(
        "SELECT * FROM user_preferences WHERE user_id = ?"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Failed to get preferences: {}", e))?;

    Ok(result)
}

pub async fn upsert_preferences(
    pool: &Pool<Sqlite>,
    user_id: &str,
    prefs: &UpdateUserPreferences,
) -> Result<UserPreferences, String> {
    let now = chrono::Utc::now().timestamp();

    // Get existing preferences or create defaults
    let existing = get_preferences(pool, user_id).await?;

    let focus_mode = prefs.focus_mode_enabled.unwrap_or(false);
    let threshold = prefs.ai_confidence_threshold.unwrap_or(85);
    let allowed_apps = prefs.allowed_apps.as_ref()
        .map(|apps| serde_json::to_string(apps).unwrap_or_else(|_| "[]".to_string()))
        .or_else(|| existing.as_ref().and_then(|e| e.allowed_apps.clone()))
        .unwrap_or_else(|| "[]".to_string());
    let blocked_apps = prefs.blocked_apps.as_ref()
        .map(|apps| serde_json::to_string(apps).unwrap_or_else(|_| "[]".to_string()))
        .or_else(|| existing.as_ref().and_then(|e| e.blocked_apps.clone()))
        .unwrap_or_else(|| "[]".to_string());
    let custom_rules = prefs.custom_rules.as_ref()
        .map(|rules| serde_json::to_string(rules).unwrap_or_else(|_| "{}".to_string()))
        .or_else(|| existing.as_ref().and_then(|e| e.custom_rules.clone()))
        .unwrap_or_else(|| "{}".to_string());
    let ollama_model = prefs.ollama_model.clone()
        .or_else(|| existing.as_ref().map(|e| e.ollama_model.clone()))
        .unwrap_or_else(|| "llama3.2:1b".to_string());

    sqlx::query_as::<_, UserPreferences>(
        r#"
        INSERT INTO user_preferences (
            user_id, focus_mode_enabled, ai_confidence_threshold,
            allowed_apps, blocked_apps, custom_rules, ollama_model, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            focus_mode_enabled = excluded.focus_mode_enabled,
            ai_confidence_threshold = excluded.ai_confidence_threshold,
            allowed_apps = excluded.allowed_apps,
            blocked_apps = excluded.blocked_apps,
            custom_rules = excluded.custom_rules,
            ollama_model = excluded.ollama_model,
            updated_at = excluded.updated_at
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(focus_mode as i32)
    .bind(threshold)
    .bind(&allowed_apps)
    .bind(&blocked_apps)
    .bind(&custom_rules)
    .bind(&ollama_model)
    .bind(now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to upsert preferences: {}", e))
}

// ============================================================================
// Focus Session Queries
// ============================================================================

pub async fn create_session(pool: &Pool<Sqlite>, user_id: &str) -> Result<FocusSession, String> {
    let now = chrono::Utc::now().timestamp();

    sqlx::query_as::<_, FocusSession>(
        r#"
        INSERT INTO focus_sessions (user_id, started_at, created_at)
        VALUES (?, ?, ?)
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(now)
    .bind(now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to create session: {}", e))
}

pub async fn end_session(pool: &Pool<Sqlite>, session_id: i64) -> Result<FocusSession, String> {
    let now = chrono::Utc::now().timestamp();

    // Get the session to calculate duration
    let session = sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM focus_sessions WHERE id = ?"
    )
    .bind(session_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get session: {}", e))?;

    let duration = now - session.started_at;

    sqlx::query_as::<_, FocusSession>(
        r#"
        UPDATE focus_sessions
        SET ended_at = ?, duration_seconds = ?
        WHERE id = ?
        RETURNING *
        "#,
    )
    .bind(now)
    .bind(duration)
    .bind(session_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to end session: {}", e))
}

pub async fn get_current_session(pool: &Pool<Sqlite>, user_id: &str) -> Result<Option<FocusSession>, String> {
    sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM focus_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Failed to get current session: {}", e))
}

pub async fn get_sessions(pool: &Pool<Sqlite>, user_id: &str, limit: i32) -> Result<Vec<FocusSession>, String> {
    sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?"
    )
    .bind(user_id)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get sessions: {}", e))
}

// ============================================================================
// Signal Queries
// ============================================================================

pub async fn create_signal(
    pool: &Pool<Sqlite>,
    signal: &CreateSignal,
    decision: &FilterDecision,
) -> Result<Signal, String> {
    let now = chrono::Utc::now().timestamp();

    sqlx::query_as::<_, Signal>(
        r#"
        INSERT INTO signals (
            user_id, session_id, source_app, content_snippet, full_content,
            action, confidence_score, ai_reasoning, timestamp, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
        "#,
    )
    .bind(&signal.user_id)
    .bind(signal.session_id)
    .bind(&signal.source_app)
    .bind(&signal.content_snippet)
    .bind(&signal.full_content)
    .bind(&decision.action)
    .bind(decision.confidence)
    .bind(&decision.reasoning)
    .bind(now)
    .bind(now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to create signal: {}", e))
}

pub async fn get_signals(
    pool: &Pool<Sqlite>,
    user_id: &str,
    limit: i32,
    offset: i32,
) -> Result<Vec<Signal>, String> {
    sqlx::query_as::<_, Signal>(
        "SELECT * FROM signals WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    )
    .bind(user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get signals: {}", e))
}

pub async fn get_signal_stats(pool: &Pool<Sqlite>, user_id: &str) -> Result<SignalStats, String> {
    let total: (i32,) = sqlx::query_as(
        "SELECT COUNT(*) FROM signals WHERE user_id = ?"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to count signals: {}", e))?;

    let blocked: (i32,) = sqlx::query_as(
        "SELECT COUNT(*) FROM signals WHERE user_id = ? AND action = 'BLOCKED'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to count blocked signals: {}", e))?;

    let allowed: (i32,) = sqlx::query_as(
        "SELECT COUNT(*) FROM signals WHERE user_id = ? AND action = 'ALLOWED'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to count allowed signals: {}", e))?;

    let block_rate = if total.0 > 0 {
        (blocked.0 as f64 / total.0 as f64) * 100.0
    } else {
        0.0
    };

    Ok(SignalStats {
        total_signals: total.0,
        blocked: blocked.0,
        allowed: allowed.0,
        block_rate,
    })
}

// ============================================================================
// Dashboard Stats
// ============================================================================

pub async fn get_dashboard_stats(pool: &Pool<Sqlite>, user_id: &str) -> Result<DashboardStats, String> {
    // Get total focus time
    let total_time: (Option<i64>,) = sqlx::query_as(
        "SELECT SUM(duration_seconds) FROM focus_sessions WHERE user_id = ? AND ended_at IS NOT NULL"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get total focus time: {}", e))?;

    // Get signal stats
    let signal_stats = get_signal_stats(pool, user_id).await?;

    // Get current session
    let current_session = get_current_session(pool, user_id).await?;

    // Calculate efficiency (percentage of time in focus vs total time)
    let efficiency = if signal_stats.total_signals > 0 {
        (signal_stats.blocked as f64 / signal_stats.total_signals as f64) * 100.0
    } else {
        0.0
    };

    Ok(DashboardStats {
        total_focus_time: total_time.0.unwrap_or(0),
        signals_blocked: signal_stats.blocked,
        signals_allowed: signal_stats.allowed,
        efficiency,
        current_session,
    })
}
