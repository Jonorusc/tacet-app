use crate::db::{models::*, queries};
use crate::AppState;
use tauri::State;

/// Start a new focus session
#[tauri::command]
pub async fn start_focus_session(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<FocusSession, String> {
    let pool = state.db.lock().await;
    
    // Check if there's already an active session
    if let Some(active) = queries::get_current_session(&pool, &user_id).await? {
        return Err(format!("Session {} is already active", active.id));
    }
    
    // Create new session
    let session = queries::create_session(&pool, &user_id).await?;
    
    // TODO: Enable system-level notification blocking (Phase 5)
    
    Ok(session)
}

/// End a focus session
#[tauri::command]
pub async fn end_focus_session(
    session_id: i64,
    state: State<'_, AppState>,
) -> Result<FocusSession, String> {
    let pool = state.db.lock().await;
    
    // End the session
    let session = queries::end_session(&pool, session_id).await?;
    
    // TODO: Disable system-level notification blocking (Phase 5)
    
    Ok(session)
}

/// Get session history for a user
#[tauri::command]
pub async fn get_sessions(
    user_id: String,
    limit: Option<i32>,
    state: State<'_, AppState>,
) -> Result<Vec<FocusSession>, String> {
    let pool = state.db.lock().await;
    let limit = limit.unwrap_or(20);
    
    queries::get_sessions(&pool, &user_id, limit).await
}

/// Get the current active session for a user
#[tauri::command]
pub async fn get_current_session(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<Option<FocusSession>, String> {
    let pool = state.db.lock().await;
    queries::get_current_session(&pool, &user_id).await
}
