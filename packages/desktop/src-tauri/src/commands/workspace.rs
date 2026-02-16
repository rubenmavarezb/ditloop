use serde::Serialize;
use std::path::PathBuf;
use tokio::process::Command as AsyncCommand;

/// Workspace information detected from filesystem.
#[derive(Debug, Serialize)]
pub struct WorkspaceInfo {
    pub name: String,
    pub path: String,
    pub has_git: bool,
    pub has_aidf: bool,
    pub git_branch: Option<String>,
    pub last_modified: Option<u64>,
}

/// Scan a directory for git repos with optional .ai/ folders.
#[tauri::command]
pub async fn detect_workspaces(base_path: String) -> Result<Vec<WorkspaceInfo>, String> {
    let base = PathBuf::from(&base_path);
    if !base.is_dir() {
        return Err(format!("Not a directory: {}", base_path));
    }

    let mut workspaces = Vec::new();
    let mut entries = tokio::fs::read_dir(&base).await.map_err(|e| e.to_string())?;

    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let has_git = path.join(".git").exists();
        if !has_git {
            continue;
        }

        let has_aidf = path.join(".ai").exists();
        let git_branch = get_current_branch(&path).await;
        let last_modified = tokio::fs::metadata(&path)
            .await
            .ok()
            .and_then(|m| m.modified().ok())
            .and_then(|t| {
                t.duration_since(std::time::SystemTime::UNIX_EPOCH)
                    .ok()
                    .map(|d| d.as_secs())
            });

        workspaces.push(WorkspaceInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            has_git,
            has_aidf,
            git_branch,
            last_modified,
        });
    }

    workspaces.sort_by(|a, b| b.last_modified.cmp(&a.last_modified));
    Ok(workspaces)
}

/// Get detailed workspace info for a single path.
#[tauri::command]
pub async fn get_workspace_info(path: String) -> Result<WorkspaceInfo, String> {
    let ws_path = PathBuf::from(&path);
    if !ws_path.is_dir() {
        return Err(format!("Not a directory: {}", path));
    }

    let has_git = ws_path.join(".git").exists();
    let has_aidf = ws_path.join(".ai").exists();
    let git_branch = get_current_branch(&ws_path).await;
    let last_modified = tokio::fs::metadata(&ws_path)
        .await
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| {
            t.duration_since(std::time::SystemTime::UNIX_EPOCH)
                .ok()
                .map(|d| d.as_secs())
        });

    Ok(WorkspaceInfo {
        name: ws_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone()),
        path,
        has_git,
        has_aidf,
        git_branch,
        last_modified,
    })
}

/// Open a terminal at the given path.
#[tauri::command]
pub async fn open_in_terminal(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        AsyncCommand::new("open")
            .args(["-a", "Terminal", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        AsyncCommand::new("cmd")
            .args(["/c", "start", "cmd", "/k"])
            .arg(format!("cd /d \"{}\"", path.replace('"', "")))
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        let terminals = ["x-terminal-emulator", "gnome-terminal", "konsole", "xterm"];
        let mut launched = false;
        for term in &terminals {
            if AsyncCommand::new(term)
                .arg(&format!("--working-directory={}", path))
                .spawn()
                .is_ok()
            {
                launched = true;
                break;
            }
        }
        if !launched {
            return Err("Could not find a terminal emulator".to_string());
        }
    }

    Ok(())
}

/// Open a path in the default code editor.
#[tauri::command]
pub async fn open_in_editor(path: String, editor: Option<String>) -> Result<(), String> {
    let cmd = editor.unwrap_or_else(|| "code".to_string());
    AsyncCommand::new(&cmd)
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Failed to open {}: {}", cmd, e))?;
    Ok(())
}

/// Get the current git branch for a repository path.
async fn get_current_branch(path: &PathBuf) -> Option<String> {
    AsyncCommand::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(path)
        .output()
        .await
        .ok()
        .and_then(|output| {
            if output.status.success() {
                Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                None
            }
        })
}
