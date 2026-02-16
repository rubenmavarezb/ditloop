use serde::{Deserialize, Serialize};
use std::fs;
use tokio::process::Command;

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

    // Expand ~ to home directory in workspace paths
    let mut config = config;
    let home_str = home.to_string_lossy().to_string();
    for ws in &mut config.workspaces {
        if ws.path.starts_with('~') {
            ws.path = ws.path.replacen('~', &home_str, 1);
        }
    }

    Ok(ConfigLoadResult {
        config,
        config_path: config_path_str,
        exists: true,
    })
}

/// Switch to a named git profile from DitLoop config.
/// Sets global git user.name and user.email.
#[tauri::command]
pub async fn switch_git_profile(profile_name: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let config_path = home.join(".ditloop").join("config.yml");

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;
    let config: DitLoopConfigFile = serde_yaml::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    let profile = config
        .profiles
        .get(&profile_name)
        .ok_or_else(|| format!("Profile '{}' not found in config", profile_name))?;

    Command::new("git")
        .args(["config", "--global", "user.name", &profile.name])
        .output()
        .await
        .map_err(|e| format!("Failed to set git user.name: {}", e))?;

    Command::new("git")
        .args(["config", "--global", "user.email", &profile.email])
        .output()
        .await
        .map_err(|e| format!("Failed to set git user.email: {}", e))?;

    Ok(())
}

/// Get the current git identity (user.email).
#[tauri::command]
pub async fn get_git_identity() -> Result<Option<String>, String> {
    let output = Command::new("git")
        .args(["config", "user.email"])
        .output()
        .await
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if output.status.success() {
        let email = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(if email.is_empty() { None } else { Some(email) })
    } else {
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_config_yaml() {
        let yaml = r#"
profiles:
  personal:
    name: Test User
    email: test@example.com
    sshHost: github-personal
  work:
    name: Work User
    email: work@example.com

workspaces:
  - name: my-project
    path: /home/user/projects/my-project
    type: single
    profile: personal
    aidf: true
  - name: work-project
    path: /home/user/work/project
    profile: work
"#;
        let config: DitLoopConfigFile = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.profiles.len(), 2);
        assert_eq!(config.workspaces.len(), 2);

        let personal = &config.profiles["personal"];
        assert_eq!(personal.name, "Test User");
        assert_eq!(personal.email, "test@example.com");
        assert_eq!(personal.ssh_host, Some("github-personal".to_string()));

        let ws = &config.workspaces[0];
        assert_eq!(ws.name, "my-project");
        assert!(ws.aidf);
        assert_eq!(ws.profile, "personal");

        let ws2 = &config.workspaces[1];
        assert!(!ws2.aidf); // default
        assert_eq!(ws2.r#type, "single"); // default
    }

    #[test]
    fn test_tilde_expansion_in_workspace_paths() {
        let yaml = r#"
workspaces:
  - name: my-project
    path: ~/projects/my-project
    profile: personal
  - name: abs-project
    path: /home/user/work
    profile: work
"#;
        let mut config: DitLoopConfigFile = serde_yaml::from_str(yaml).unwrap();
        let home_str = dirs::home_dir().unwrap().to_string_lossy().to_string();
        for ws in &mut config.workspaces {
            if ws.path.starts_with('~') {
                ws.path = ws.path.replacen('~', &home_str, 1);
            }
        }
        assert!(config.workspaces[0].path.starts_with(&home_str));
        assert!(!config.workspaces[0].path.contains('~'));
        // Absolute path should be unchanged
        assert_eq!(config.workspaces[1].path, "/home/user/work");
    }

    #[test]
    fn test_parse_empty_config() {
        let yaml = "{}";
        let config: DitLoopConfigFile = serde_yaml::from_str(yaml).unwrap();
        assert!(config.profiles.is_empty());
        assert!(config.workspaces.is_empty());
    }

    #[test]
    fn test_load_ditloop_config_returns_result() {
        // This test just verifies the function doesn't panic.
        // It may return exists: false if no config file is present.
        let result = load_ditloop_config();
        assert!(result.is_ok());
    }
}
