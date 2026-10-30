use crate::db::{models::*, queries};
use crate::AppState;
use tauri::State;

/// Get user preferences
#[tauri::command]
pub async fn get_preferences(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<UserPreferences, String> {
    let pool = state.db.lock().await;
    
    // Get preferences or create defaults
    if let Some(prefs) = queries::get_preferences(&pool, &user_id).await? {
        Ok(prefs)
    } else {
        // Create default preferences
        let defaults = UpdateUserPreferences {
            focus_mode_enabled: Some(false),
            ai_confidence_threshold: Some(85),
            allowed_apps: Some(vec![]),
            blocked_apps: Some(vec![]),
            custom_rules: Some(serde_json::json!({})),
            ollama_model: Some("llama3.2:1b".to_string()),
        };
        
        queries::upsert_preferences(&pool, &user_id, &defaults).await
    }
}

/// Update user preferences
#[tauri::command]
pub async fn update_preferences(
    user_id: String,
    preferences: UpdateUserPreferences,
    state: State<'_, AppState>,
) -> Result<UserPreferences, String> {
    let pool = state.db.lock().await;
    queries::upsert_preferences(&pool, &user_id, &preferences).await
}
