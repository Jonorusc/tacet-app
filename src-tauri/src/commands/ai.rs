use crate::services::OllamaService;
use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;

// Global Ollama service state
pub struct OllamaState {
    pub service: Arc<Mutex<OllamaService>>,
}

impl OllamaState {
    pub fn new() -> Self {
        Self {
            service: Arc::new(Mutex::new(OllamaService::new())),
        }
    }
}

/// Check if Ollama is available
#[tauri::command]
pub async fn check_ollama_available(
    state: State<'_, OllamaState>,
) -> Result<bool, String> {
    let service = state.service.lock().await;
    Ok(service.is_available().await)
}

/// List available Ollama models
#[tauri::command]
pub async fn list_ollama_models(
    state: State<'_, OllamaState>,
) -> Result<Vec<String>, String> {
    let service = state.service.lock().await;
    service.list_models().await
}

/// Load an Ollama model (warm it up)
#[tauri::command]
pub async fn load_ollama_model(
    model: String,
    state: State<'_, OllamaState>,
) -> Result<(), String> {
    let service = state.service.lock().await;
    service.load_model(&model).await
}

/// Unload Ollama model (free memory)
#[tauri::command]
pub async fn unload_ollama_model(
    state: State<'_, OllamaState>,
) -> Result<(), String> {
    let service = state.service.lock().await;
    service.unload_model().await
}

/// Test Ollama with a simple prompt
#[tauri::command]
pub async fn test_ollama(
    model: String,
    state: State<'_, OllamaState>,
) -> Result<String, String> {
    let service = state.service.lock().await;
    service.generate(&model, "Say 'Hello! I am ready to filter notifications.'").await
}
