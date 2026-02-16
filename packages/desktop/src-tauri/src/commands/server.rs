use serde::Serialize;
use std::time::Duration;

/// Server info returned by auto-detection.
#[derive(Debug, Serialize)]
pub struct ServerInfo {
    pub url: String,
    pub port: u16,
    pub healthy: bool,
}

/// Server health response.
#[derive(Debug, Serialize)]
pub struct ServerHealth {
    pub status: String,
    pub version: Option<String>,
}

/// Probe common ports for a running DitLoop server.
#[tauri::command]
pub async fn detect_local_server() -> Option<ServerInfo> {
    let ports: Vec<u16> = vec![4321, 4322, 4323, 3000, 8080];

    for port in ports {
        let url = format!("http://localhost:{}", port);
        if let Ok(health) = health_check(url.clone()).await {
            if health.status == "ok" {
                return Some(ServerInfo {
                    url,
                    port,
                    healthy: true,
                });
            }
        }
    }

    None
}

/// Ping server health endpoint.
#[tauri::command]
pub async fn health_check(url: String) -> Result<ServerHealth, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(format!("{}/api/health", url))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        Ok(ServerHealth {
            status: body
                .get("status")
                .and_then(|v| v.as_str())
                .unwrap_or("ok")
                .to_string(),
            version: body
                .get("version")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string()),
        })
    } else {
        Err(format!("Server returned {}", response.status()))
    }
}
