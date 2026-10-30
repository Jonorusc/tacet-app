use sqlx::{sqlite::SqlitePool, Pool, Sqlite};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub mod models;
pub mod queries;

/// Initialize the SQLite database connection
pub async fn init_db(app_handle: &AppHandle) -> Result<Pool<Sqlite>, String> {
    let db_path = get_db_path(app_handle)?;
    
    // Ensure parent directory exists
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create database directory: {}", e))?;
    }

    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
    
    let pool = SqlitePool::connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Run migrations
    run_migrations(&pool).await?;

    Ok(pool)
}

/// Get the database file path
fn get_db_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    Ok(app_data_dir.join("tacet.db"))
}

/// Run database migrations
async fn run_migrations(pool: &Pool<Sqlite>) -> Result<(), String> {
    // Create users table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            subscription_plan TEXT DEFAULT 'free',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create users table: {}", e))?;

    // Create user_preferences table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id TEXT PRIMARY KEY REFERENCES users(id),
            focus_mode_enabled INTEGER DEFAULT 0,
            ai_confidence_threshold INTEGER DEFAULT 85,
            allowed_apps TEXT,
            blocked_apps TEXT,
            custom_rules TEXT,
            ollama_model TEXT DEFAULT 'llama3.2:1b',
            updated_at INTEGER NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create user_preferences table: {}", e))?;

    // Create focus_sessions table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS focus_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT REFERENCES users(id),
            started_at INTEGER NOT NULL,
            ended_at INTEGER,
            duration_seconds INTEGER,
            signals_blocked INTEGER DEFAULT 0,
            signals_allowed INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create focus_sessions table: {}", e))?;

    // Create signals table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT REFERENCES users(id),
            session_id INTEGER REFERENCES focus_sessions(id),
            source_app TEXT NOT NULL,
            content_snippet TEXT,
            full_content TEXT,
            action TEXT NOT NULL CHECK (action IN ('ALLOWED', 'BLOCKED')),
            confidence_score INTEGER,
            ai_reasoning TEXT,
            timestamp INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create signals table: {}", e))?;

    // Create indexes
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id)")
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create index: {}", e))?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC)")
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create index: {}", e))?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON focus_sessions(user_id)")
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create index: {}", e))?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON focus_sessions(started_at DESC)")
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create index: {}", e))?;

    Ok(())
}
