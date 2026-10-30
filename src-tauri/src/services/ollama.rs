use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

// Import FilterDecision from db::models to avoid duplication
use crate::db::models::FilterDecision;

const OLLAMA_BASE_URL: &str = "http://localhost:11434";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaResponse {
    pub response: String,
    pub done: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size: i64,
    pub modified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelsResponse {
    pub models: Vec<ModelInfo>,
}

/// Ollama AI Service with smart loading/unloading
pub struct OllamaService {
    client: Client,
    current_model: Arc<Mutex<Option<String>>>,
}

impl OllamaService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            current_model: Arc::new(Mutex::new(None)),
        }
    }

    /// Check if Ollama is running
    pub async fn is_available(&self) -> bool {
        match self.client.get(format!("{}/api/tags", OLLAMA_BASE_URL)).send().await {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }

    /// List available models
    pub async fn list_models(&self) -> Result<Vec<String>, String> {
        let response = self
            .client
            .get(format!("{}/api/tags", OLLAMA_BASE_URL))
            .send()
            .await
            .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

        if !response.status().is_success() {
            return Err("Ollama is not running".to_string());
        }

        let models_response: ModelsResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse models: {}", e))?;

        Ok(models_response.models.iter().map(|m| m.name.clone()).collect())
    }

    /// Load a model (warm it up)
    pub async fn load_model(&self, model: &str) -> Result<(), String> {
        // Check if model is already loaded
        let current = self.current_model.lock().await;
        if current.as_ref() == Some(&model.to_string()) {
            return Ok(());
        }
        drop(current);

        // Send a small prompt to load the model into memory
        let request = OllamaRequest {
            model: model.to_string(),
            prompt: "Hello".to_string(),
            stream: false,
        };

        let response = self
            .client
            .post(format!("{}/api/generate", OLLAMA_BASE_URL))
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Failed to load model: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Failed to load model: {}", response.status()));
        }

        // Update current model
        let mut current = self.current_model.lock().await;
        *current = Some(model.to_string());

        Ok(())
    }

    /// Unload model (free memory)
    pub async fn unload_model(&self) -> Result<(), String> {
        // Ollama doesn't have a direct unload API, but we can track it
        let mut current = self.current_model.lock().await;
        *current = None;
        Ok(())
    }

    /// Generate a response from Ollama
    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<String, String> {
        let request = OllamaRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
        };

        let response = self
            .client
            .post(format!("{}/api/generate", OLLAMA_BASE_URL))
            .json(&request)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await
            .map_err(|e| format!("Failed to generate response: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Ollama error: {}", response.status()));
        }

        let ollama_response: OllamaResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(ollama_response.response)
    }

    /// Filter a notification using AI
    pub async fn filter_notification(
        &self,
        model: &str,
        source_app: &str,
        content: &str,
        user_context: &str,
    ) -> Result<FilterDecision, String> {
        let prompt = build_filter_prompt(source_app, content, user_context);
        
        let response = self.generate(model, &prompt).await?;
        
        // Parse the AI response
        parse_filter_response(&response)
    }
}

/// Build a context-aware prompt for notification filtering
fn build_filter_prompt(source_app: &str, content: &str, user_context: &str) -> String {
    format!(
        r#"You are a notification filter assistant. Analyze this notification and decide if it should be ALLOWED or BLOCKED during a focus session.

Source App: {}
Content: {}
User Context: {}

Rules:
1. ALLOW if urgent (emergencies, critical alerts, security issues)
2. ALLOW if work-related and time-sensitive
3. BLOCK if social media, entertainment, or non-urgent
4. BLOCK if promotional or spam

Respond in this exact format:
ACTION: [ALLOW or BLOCK]
CONFIDENCE: [0-100]
REASONING: [brief explanation]

Your response:"#,
        source_app, content, user_context
    )
}

/// Parse AI response into FilterDecision
fn parse_filter_response(response: &str) -> Result<FilterDecision, String> {
    let mut action = String::new();
    let mut confidence = 75;
    let mut reasoning = String::new();

    for line in response.lines() {
        let line = line.trim();
        if line.starts_with("ACTION:") {
            action = line.replace("ACTION:", "").trim().to_uppercase();
        } else if line.starts_with("CONFIDENCE:") {
            if let Ok(conf) = line.replace("CONFIDENCE:", "").trim().parse::<i32>() {
                confidence = conf.clamp(0, 100);
            }
        } else if line.starts_with("REASONING:") {
            reasoning = line.replace("REASONING:", "").trim().to_string();
        }
    }

    // Validate action
    if action != "ALLOW" && action != "BLOCK" {
        // Fallback: try to detect from response text
        let response_lower = response.to_lowercase();
        if response_lower.contains("allow") {
            action = "ALLOW".to_string();
        } else if response_lower.contains("block") {
            action = "BLOCK".to_string();
        } else {
            return Err("Could not parse AI response".to_string());
        }
    }

    if reasoning.is_empty() {
        reasoning = "AI decision based on content analysis".to_string();
    }

    Ok(FilterDecision {
        action,
        confidence,
        reasoning,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_filter_response() {
        let response = r#"
ACTION: BLOCK
CONFIDENCE: 85
REASONING: Social media notification, not urgent
        "#;

        let decision = parse_filter_response(response).unwrap();
        assert_eq!(decision.action, "BLOCK");
        assert_eq!(decision.confidence, 85);
        assert!(decision.reasoning.contains("Social media"));
    }
}
