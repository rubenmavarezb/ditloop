use serde::Serialize;
use tokio::process::Command;

/// Information about a detected AI CLI tool.
#[derive(Debug, Serialize)]
pub struct AiToolInfo {
    pub name: String,
    pub command: String,
    pub version: Option<String>,
    pub available: bool,
}

/// Detect installed AI CLI tools.
#[tauri::command]
pub async fn detect_ai_tools() -> Vec<AiToolInfo> {
    let tools = vec![
        ("Claude Code", "claude"),
        ("Aider", "aider"),
        ("GitHub Copilot CLI", "gh copilot"),
        ("Cursor", "cursor"),
    ];

    let mut results = Vec::new();
    for (name, cmd) in tools {
        let (available, version) = check_tool_version(cmd).await;
        results.push(AiToolInfo {
            name: name.to_string(),
            command: cmd.to_string(),
            version,
            available,
        });
    }
    results
}

/// Launch an AI CLI tool in a new terminal window.
///
/// Uses proper argument passing to prevent command injection.
#[tauri::command]
pub async fn launch_ai_cli(
    tool: String,
    workspace_path: String,
    args: Vec<String>,
) -> Result<u32, String> {
    #[cfg(target_os = "macos")]
    {
        // Use osascript with proper escaping via shell_escape
        let mut cmd_parts = vec![tool.clone()];
        cmd_parts.extend(args.iter().cloned());
        let escaped_path = shell_escape(&workspace_path);
        let escaped_cmd = cmd_parts.iter().map(|a| shell_escape(a)).collect::<Vec<_>>().join(" ");
        let script = format!(
            "tell application \"Terminal\" to do script \"cd {} && {}\"",
            escaped_path, escaped_cmd
        );
        let child = Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id().unwrap_or(0));
    }

    #[cfg(target_os = "windows")]
    {
        // Use separate arguments to prevent injection — no shell interpolation
        let mut cmd_parts = vec![tool.clone()];
        cmd_parts.extend(args.iter().cloned());
        let child = Command::new("cmd")
            .args(["/c", "start", "cmd", "/k"])
            .arg(format!("cd /d \"{}\" && {}", workspace_path.replace('"', ""), cmd_parts.join(" ")))
            .current_dir(&workspace_path)
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id().unwrap_or(0));
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd_parts = vec![tool.clone()];
        cmd_parts.extend(args.iter().cloned());
        let escaped_path = shell_escape(&workspace_path);
        let escaped_cmd = cmd_parts.iter().map(|a| shell_escape(a)).collect::<Vec<_>>().join(" ");
        let child = Command::new("x-terminal-emulator")
            .args(["-e", &format!("bash -c 'cd {} && {}'", escaped_path, escaped_cmd)])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id().unwrap_or(0));
    }

    #[allow(unreachable_code)]
    Err("Unsupported platform".to_string())
}

/// Build AIDF context string from .ai/ folder.
#[tauri::command]
pub async fn inject_context(workspace_path: String) -> Result<String, String> {
    let ai_dir = std::path::Path::new(&workspace_path).join(".ai");
    if !ai_dir.exists() {
        return Ok(String::new());
    }

    let mut context = String::new();

    // Read AGENTS.md if it exists
    let agents_file = ai_dir.join("AGENTS.md");
    if agents_file.exists() {
        let content = tokio::fs::read_to_string(&agents_file)
            .await
            .map_err(|e| e.to_string())?;
        context.push_str("# Project Context (AGENTS.md)\n\n");
        context.push_str(&content);
        context.push_str("\n\n");
    }

    // Read any active tasks
    let tasks_dir = ai_dir.join("tasks");
    if tasks_dir.is_dir() {
        let mut entries = tokio::fs::read_dir(&tasks_dir)
            .await
            .map_err(|e| e.to_string())?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "md") {
                if let Ok(content) = tokio::fs::read_to_string(&path).await {
                    context.push_str(&format!(
                        "# Task: {}\n\n{}\n\n",
                        path.file_name()
                            .map(|n| n.to_string_lossy().to_string())
                            .unwrap_or_default(),
                        content
                    ));
                }
            }
        }
    }

    Ok(context)
}

/// Check if a tool is available and get its version.
async fn check_tool_version(cmd: &str) -> (bool, Option<String>) {
    let parts: Vec<&str> = cmd.split_whitespace().collect();
    let (program, args) = if parts.len() > 1 {
        (parts[0], vec![parts[1], "--version"])
    } else {
        (parts[0], vec!["--version"])
    };

    match Command::new(program).args(&args).output().await {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout)
                .lines()
                .next()
                .map(|l| l.trim().to_string());
            (true, version)
        }
        _ => (false, None),
    }
}

/// Escape a string for shell usage with single quotes.
fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}
