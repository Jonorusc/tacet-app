use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_deep_link::DeepLinkExt;
use sqlx::{Pool, Sqlite};
use std::sync::Arc;
use tokio::sync::Mutex;

mod db;
mod commands;
mod services;

pub const CLERK_PUBLIC_KEY: &str = env!("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");

// Global state for database connection
pub struct AppState {
    pub db: Arc<Mutex<Pool<Sqlite>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("Single instance triggering args: {:?}", args);

            // 1. Encontra o argumento que é a URL (filtra pelo esquema do seu app)
            let url = args
                .iter()
                .find(|arg| arg.starts_with(&format!("{}://", "tacet")));

            if let Some(url) = url {
                // 2. Dispara o evento manualmente para o Frontend
                // O nome do evento deve bater com o que o plugin JS espera, geralmente "deep-link://new-url"
                let _ = app.emit("deep-link://new-url", vec![url]);
            }

            // Traz a janela para frente
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_clerk::ClerkPluginBuilder::new()
                .publishable_key(CLERK_PUBLIC_KEY)
                .with_tauri_store()
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            commands::verify_clerk_token,
            commands::get_user_subscription,
            commands::sync_user_data,
            // Signal commands
            commands::log_signal,
            commands::get_signals,
            commands::process_signal,
            commands::get_signal_stats,
            // Session commands
            commands::start_focus_session,
            commands::end_focus_session,
            commands::get_sessions,
            commands::get_current_session,
            // Stats commands
            commands::get_dashboard_stats,
            commands::get_trends,
            // Preferences commands
            commands::get_preferences,
            commands::update_preferences,
            // AI commands
            commands::check_ollama_available,
            commands::list_ollama_models,
            commands::load_ollama_model,
            commands::unload_ollama_model,
            commands::test_ollama,
        ])
        .setup(|app| {
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            {
                app.deep_link().register_all()?;
            }

            // Initialize database
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                match db::init_db(&app_handle).await {
                    Ok(pool) => {
                        println!("✅ Database initialized successfully");
                        app_handle.manage(AppState {
                            db: Arc::new(Mutex::new(pool)),
                        });
                    }
                    Err(e) => {
                        eprintln!("❌ Failed to initialize database: {}", e);
                        // Don't panic, allow app to continue but log the error
                    }
                }
            });

            // Initialize Ollama service
            app.manage(commands::ai::OllamaState::new());
            println!("✅ Ollama service initialized");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
