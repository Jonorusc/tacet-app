use crate::db::{models::*, queries};
use crate::AppState;
use tauri::State;

/// Log a signal (notification) to the database
#[tauri::command]
pub async fn log_signal(
    signal: CreateSignal,
    decision: FilterDecision,
    state: State<'_, AppState>,
) -> Result<Signal, String> {
    let pool = state.db.lock().await;
    queries::create_signal(&pool, &signal, &decision).await
}

/// Get signal history with pagination
#[tauri::command]
pub async fn get_signals(
    user_id: String,
    limit: Option<i32>,
    offset: Option<i32>,
    state: State<'_, AppState>,
) -> Result<Vec<Signal>, String> {
    let pool = state.db.lock().await;
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    
    queries::get_signals(&pool, &user_id, limit, offset).await
}

/// Process a signal through AI filter (Ollama with rule-based fallback)
#[tauri::command]
pub async fn process_signal(
    signal: CreateSignal,
    state: State<'_, AppState>,
    ollama_state: State<'_, crate::commands::ai::OllamaState>,
) -> Result<FilterDecision, String> {
    let pool = state.db.lock().await;
    
    // Get user preferences
    let prefs = queries::get_preferences(&pool, &signal.user_id)
        .await?
        .ok_or("User preferences not found")?;
    
    // Try AI filtering if Ollama is available and user has it enabled
    let decision = if prefs.focus_mode_enabled {
        let ollama = ollama_state.service.lock().await;
        
        // Check if Ollama is available
        if ollama.is_available().await {
            // Build user context from preferences
            let user_context = format!(
                "User is in focus mode. Confidence threshold: {}%",
                prefs.ai_confidence_threshold
            );
            
            // Try AI filtering
            match ollama.filter_notification(
                &prefs.ollama_model,
                &signal.source_app,
                signal.content_snippet.as_deref().unwrap_or(""),
                &user_context,
            ).await {
                Ok(ai_decision) => ai_decision,
                Err(e) => {
                    // Fallback to rules if AI fails
                    eprintln!("AI filtering failed: {}, using rules", e);
                    rule_based_filter(&signal, &prefs)
                }
            }
        } else {
            // Ollama not available, use rules
            rule_based_filter(&signal, &prefs)
        }
    } else {
        // Focus mode disabled, use rules
        rule_based_filter(&signal, &prefs)
    };
    
    // Log the signal
    queries::create_signal(&pool, &signal, &decision).await?;
    
    Ok(decision)
}

/// Get signal statistics for a user
#[tauri::command]
pub async fn get_signal_stats(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<SignalStats, String> {
    let pool = state.db.lock().await;
    queries::get_signal_stats(&pool, &user_id).await
}

// Rule-based filtering (fallback before Ollama integration)
fn rule_based_filter(signal: &CreateSignal, prefs: &UserPreferences) -> FilterDecision {
    // Parse allowed/blocked apps from JSON strings
    let allowed_apps: Vec<String> = prefs.allowed_apps
        .as_ref()
        .and_then(|s| serde_json::from_str(s).ok())
        .unwrap_or_default();
    
    let blocked_apps: Vec<String> = prefs.blocked_apps
        .as_ref()
        .and_then(|s| serde_json::from_str(s).ok())
        .unwrap_or_default();

    // Rule 1: Check allowed apps
    if allowed_apps.contains(&signal.source_app) {
        return FilterDecision {
            action: "ALLOWED".to_string(),
            confidence: 100,
            reasoning: "App is in allowed list".to_string(),
        };
    }

    // Rule 2: Check blocked apps
    if blocked_apps.contains(&signal.source_app) {
        return FilterDecision {
            action: "BLOCKED".to_string(),
            confidence: 100,
            reasoning: "App is in blocked list".to_string(),
        };
    }

    // Rule 3: Check for urgent keywords
    let urgent_keywords = [
        "urgent", "emergency", "critical", "server down", 
        "error", "failed", "alert", "security", "breach"
    ];
    
    if let Some(content) = &signal.content_snippet {
        let content_lower = content.to_lowercase();
        
        for keyword in urgent_keywords {
            if content_lower.contains(keyword) {
                return FilterDecision {
                    action: "ALLOWED".to_string(),
                    confidence: 85,
                    reasoning: format!("Contains urgent keyword: {}", keyword),
                };
            }
        }
    }

    // Default: Block
    FilterDecision {
        action: "BLOCKED".to_string(),
        confidence: 75,
        reasoning: "No urgent indicators detected".to_string(),
    }
}
