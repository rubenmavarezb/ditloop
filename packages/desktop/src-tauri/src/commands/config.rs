use serde::{Deserialize, Serialize};
use std::fs;

/// Profile from DitLoop config.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileConfig {
    pub name: String,
    pub email: String,
    #[serde(default)]
    pub ssh_host: Option<String>,
    #[serde(default)]
    pub ssh_key: Option<String>,
    #[serde(default)]
    pub platform: Option<String>,
}

/// Workspace entry from DitLoop config.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceConfig {
    pub name: String,
    pub path: String,
    #[serde(default = "default_workspace_type")]
    pub r#type: String,
    pub profile: String,
    #[serde(default)]
    pub aidf: bool,
}

fn default_workspace_type() -> String {
    "single".to_string()
}

/// Full DitLoop config file.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DitLoopConfigFile {
    #[serde(default)]
    pub profiles: std::collections::HashMap<String, ProfileConfig>,
    #[serde(default)]
    pub workspaces: Vec<WorkspaceConfig>,
}

/// Config load result with metadata.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigLoadResult {
    pub config: DitLoopConfigFile,
    pub config_path: String,
    pub exists: bool,
}

/// Load DitLoop config from ~/.ditloop/config.yml.
#[tauri::command]
pub fn load_ditloop_config() -> Result<ConfigLoadResult, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let config_path = home.join(".ditloop").join("config.yml");
    let config_path_str = config_path.to_string_lossy().to_string();

    if !config_path.exists() {
        return Ok(ConfigLoadResult {
            config: DitLoopConfigFile::default(),
            config_path: config_path_str,
            exists: false,
        });
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    let config: DitLoopConfigFile = serde_yaml::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(ConfigLoadResult {
        config,
        config_path: config_path_str,
        exists: true,
    })
}

/// Get the current git identity (user.email).
#[tauri::command]
pub fn get_git_identity() -> Result<Option<String>, String> {
    let output = std::process::Command::new("git")
        .args(["config", "user.email"])
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if output.status.success() {
        let email = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(if email.is_empty() { None } else { Some(email) })
    } else {
        Ok(None)
    }
}
