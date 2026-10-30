use crate::db::{models::*, queries};
use crate::AppState;
use tauri::State;

/// Get dashboard statistics for a user
#[tauri::command]
pub async fn get_dashboard_stats(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<DashboardStats, String> {
    let pool = state.db.lock().await;
    queries::get_dashboard_stats(&pool, &user_id).await
}

/// Get trend data for a specific period
#[tauri::command]
pub async fn get_trends(
    user_id: String,
    period: String, // "day" | "week" | "month"
    state: State<'_, AppState>,
) -> Result<TrendData, String> {
    let pool = state.db.lock().await;
    
    let now = chrono::Utc::now().timestamp();
    let start_time = match period.as_str() {
        "day" => now - (24 * 60 * 60),
        "week" => now - (7 * 24 * 60 * 60),
        "month" => now - (30 * 24 * 60 * 60),
        _ => return Err("Invalid period. Use 'day', 'week', or 'month'".to_string()),
    };

    // Get sessions in period
    let sessions: Vec<FocusSession> = sqlx::query_as(
        "SELECT * FROM focus_sessions WHERE user_id = ? AND started_at >= ? ORDER BY started_at ASC"
    )
    .bind(&user_id)
    .bind(start_time)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to get sessions: {}", e))?;

    // Get signals in period
    let signals: Vec<Signal> = sqlx::query_as(
        "SELECT * FROM signals WHERE user_id = ? AND timestamp >= ? ORDER BY timestamp ASC"
    )
    .bind(&user_id)
    .bind(start_time)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to get signals: {}", e))?;

    // Calculate daily aggregates
    let mut daily_data: Vec<DailyTrend> = Vec::new();
    let days = match period.as_str() {
        "day" => 1,
        "week" => 7,
        "month" => 30,
        _ => 7,
    };

    for i in 0..days {
        let day_start = start_time + (i * 24 * 60 * 60);
        let day_end = day_start + (24 * 60 * 60);

        let day_sessions: Vec<&FocusSession> = sessions
            .iter()
            .filter(|s| s.started_at >= day_start && s.started_at < day_end)
            .collect();

        let day_signals: Vec<&Signal> = signals
            .iter()
            .filter(|s| s.timestamp >= day_start && s.timestamp < day_end)
            .collect();

        let total_focus_time: i64 = day_sessions
            .iter()
            .filter_map(|s| s.duration_seconds)
            .sum();

        let blocked = day_signals.iter().filter(|s| s.action == "BLOCKED").count() as i32;
        let allowed = day_signals.iter().filter(|s| s.action == "ALLOWED").count() as i32;

        daily_data.push(DailyTrend {
            date: day_start,
            focus_time: total_focus_time,
            signals_blocked: blocked,
            signals_allowed: allowed,
            sessions_count: day_sessions.len() as i32,
        });
    }

    Ok(TrendData {
        period,
        daily_data,
    })
}

// Trend data types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TrendData {
    pub period: String,
    pub daily_data: Vec<DailyTrend>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DailyTrend {
    pub date: i64,
    pub focus_time: i64,
    pub signals_blocked: i32,
    pub signals_allowed: i32,
    pub sessions_count: i32,
}
