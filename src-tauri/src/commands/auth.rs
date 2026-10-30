use crate::db::{models::*, queries};
use crate::AppState;
use tauri::State;

/// Verify Clerk JWT token and sync user to local database
#[tauri::command]
pub async fn verify_clerk_token(
    token: String,
    state: State<'_, AppState>,
) -> Result<User, String> {
    // TODO: In production, verify JWT signature with Clerk's public key
    // For now, we'll decode the JWT to extract user info
    
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err("Invalid JWT format".to_string());
    }

    // Decode the payload (base64)
    let payload = parts[1];
    let decoded = base64_decode(payload)?;
    let json: serde_json::Value = serde_json::from_str(&decoded)
        .map_err(|e| format!("Failed to parse JWT payload: {}", e))?;

    let user_id = json["sub"]
        .as_str()
        .ok_or("Missing 'sub' in JWT")?
        .to_string();
    
    let email = json["email"]
        .as_str()
        .unwrap_or("unknown@tacet.app")
        .to_string();

    // Sync user to local database
    let pool = state.db.lock().await;
    let create_user = CreateUser {
        id: user_id,
        email,
        subscription_plan: None, // Will be fetched separately
    };

    queries::upsert_user(&pool, &create_user).await
}

/// Get user subscription status from Clerk
#[tauri::command]
pub async fn get_user_subscription(
    user_id: String,
) -> Result<SubscriptionInfo, String> {
    // TODO: Query Clerk API for subscription metadata
    // For now, return free plan
    Ok(SubscriptionInfo {
        plan: "free".to_string(),
        features: vec![
            "Basic notification filtering".to_string(),
            "Up to 3 focus sessions per day".to_string(),
        ],
    })
}

/// Sync user data from Clerk (subscription status)
#[tauri::command]
pub async fn sync_user_data(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // Get subscription from Clerk
    let subscription = get_user_subscription(user_id.clone()).await?;
    
    // Update user in local database
    let pool = state.db.lock().await;
    sqlx::query(
        "UPDATE users SET subscription_plan = ?, updated_at = ? WHERE id = ?"
    )
    .bind(&subscription.plan)
    .bind(chrono::Utc::now().timestamp())
    .bind(&user_id)
    .execute(&*pool)
    .await
    .map_err(|e| format!("Failed to update subscription: {}", e))?;

    Ok(())
}

// Helper function to decode base64
fn base64_decode(input: &str) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    
    let bytes = general_purpose::STANDARD
        .decode(input)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
    String::from_utf8(bytes)
        .map_err(|e| format!("UTF-8 decode error: {}", e))
}

// Subscription info type
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SubscriptionInfo {
    pub plan: String,
    pub features: Vec<String>,
}
