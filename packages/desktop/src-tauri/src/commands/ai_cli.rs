use serde::Serialize;
use std::process::Command;

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
pub fn detect_ai_tools() -> Vec<AiToolInfo> {
    let tools = vec![
        ("Claude Code", "claude"),
        ("Aider", "aider"),
        ("GitHub Copilot CLI", "gh copilot"),
        ("Cursor", "cursor"),
    ];

    tools
        .into_iter()
        .map(|(name, cmd)| {
            let (available, version) = check_tool_version(cmd);
            AiToolInfo {
                name: name.to_string(),
                command: cmd.to_string(),
                version,
                available,
            }
        })
        .collect()
}

/// Launch an AI CLI tool in a new terminal window.
#[tauri::command]
pub fn launch_ai_cli(
    tool: String,
    workspace_path: String,
    args: Vec<String>,
) -> Result<u32, String> {
    let full_args = [vec![tool.clone()], args].concat().join(" ");

    #[cfg(target_os = "macos")]
    {
        let script = format!(
            "tell application \"Terminal\" to do script \"cd {} && {}\"",
            shell_escape(&workspace_path),
            shell_escape(&full_args)
        );
        let child = Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id());
    }

    #[cfg(target_os = "windows")]
    {
        let child = Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d {} && {}", workspace_path, full_args)])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id());
    }

    #[cfg(target_os = "linux")]
    {
        let child = Command::new("x-terminal-emulator")
            .args(["-e", &format!("bash -c 'cd {} && {}'", workspace_path, full_args)])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
        return Ok(child.id());
    }

    #[allow(unreachable_code)]
    Err("Unsupported platform".to_string())
}

/// Build AIDF context string from .ai/ folder.
#[tauri::command]
pub fn inject_context(workspace_path: String) -> Result<String, String> {
    let ai_dir = std::path::Path::new(&workspace_path).join(".ai");
    if !ai_dir.exists() {
        return Ok(String::new());
    }

    let mut context = String::new();

    // Read AGENTS.md if it exists
    let agents_file = ai_dir.join("AGENTS.md");
    if agents_file.exists() {
        let content = std::fs::read_to_string(&agents_file).map_err(|e| e.to_string())?;
        context.push_str("# Project Context (AGENTS.md)\n\n");
        context.push_str(&content);
        context.push_str("\n\n");
    }

    // Read any active tasks
    let tasks_dir = ai_dir.join("tasks");
    if tasks_dir.is_dir() {
        if let Ok(entries) = std::fs::read_dir(&tasks_dir) {
            for entry in entries.flatten() {
                if entry
                    .path()
                    .extension()
                    .map_or(false, |ext| ext == "md")
                {
                    if let Ok(content) = std::fs::read_to_string(entry.path()) {
                        context.push_str(&format!(
                            "# Task: {}\n\n{}\n\n",
                            entry.file_name().to_string_lossy(),
                            content
                        ));
                    }
                }
            }
        }
    }

    Ok(context)
}

/// Check if a tool is available and get its version.
fn check_tool_version(cmd: &str) -> (bool, Option<String>) {
    let parts: Vec<&str> = cmd.split_whitespace().collect();
    let (program, args) = if parts.len() > 1 {
        (parts[0], vec![parts[1], "--version"])
    } else {
        (parts[0], vec!["--version"])
    };

    match Command::new(program).args(&args).output() {
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

/// Escape a string for shell usage.
fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}
