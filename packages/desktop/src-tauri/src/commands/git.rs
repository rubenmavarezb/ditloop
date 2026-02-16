use serde::Serialize;
use std::path::Path;
use tokio::process::Command;

/// Parsed git status output.
#[derive(Debug, Serialize)]
pub struct GitStatus {
    pub branch: String,
    pub ahead: u32,
    pub behind: u32,
    pub staged: Vec<FileChange>,
    pub unstaged: Vec<FileChange>,
    pub untracked: Vec<String>,
}

/// A single file change entry.
#[derive(Debug, Serialize)]
pub struct FileChange {
    pub path: String,
    pub status: String,
}

/// A git commit entry.
#[derive(Debug, Serialize)]
pub struct GitCommit {
    pub hash: String,
    pub short_hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

/// A git branch entry.
#[derive(Debug, Serialize)]
pub struct GitBranch {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
}

/// Get parsed git status for a workspace.
#[tauri::command]
pub async fn git_status(workspace_path: String) -> Result<GitStatus, String> {
    let path = Path::new(&workspace_path);
    if !path.join(".git").exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .args(["status", "--porcelain=v2", "--branch"])
        .current_dir(path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut branch = String::new();
    let mut ahead = 0u32;
    let mut behind = 0u32;
    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();

    for line in stdout.lines() {
        if line.starts_with("# branch.head ") {
            branch = line.strip_prefix("# branch.head ").unwrap_or("").to_string();
        } else if line.starts_with("# branch.ab ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                ahead = parts[2].trim_start_matches('+').parse().unwrap_or(0);
                behind = parts[3].trim_start_matches('-').parse().unwrap_or(0);
            }
        } else if line.starts_with("1 ") || line.starts_with("2 ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 9 {
                let xy = parts[1];
                let file_path = parts.last().unwrap_or(&"").to_string();
                let x = xy.chars().next().unwrap_or('.');
                let y = xy.chars().nth(1).unwrap_or('.');

                if x != '.' {
                    staged.push(FileChange {
                        path: file_path.clone(),
                        status: char_to_status(x),
                    });
                }
                if y != '.' {
                    unstaged.push(FileChange {
                        path: file_path,
                        status: char_to_status(y),
                    });
                }
            }
        } else if line.starts_with("? ") {
            let file_path = line.strip_prefix("? ").unwrap_or("").to_string();
            untracked.push(file_path);
        }
    }

    Ok(GitStatus {
        branch,
        ahead,
        behind,
        staged,
        unstaged,
        untracked,
    })
}

/// Get recent git log entries.
#[tauri::command]
pub async fn git_log(workspace_path: String, count: u32) -> Result<Vec<GitCommit>, String> {
    let output = Command::new("git")
        .args([
            "log",
            &format!("-{}", count),
            "--format=%H%n%h%n%s%n%an%n%ai",
        ])
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let lines: Vec<&str> = stdout.lines().collect();
    let mut commits = Vec::new();

    for chunk in lines.chunks(5) {
        if chunk.len() >= 5 {
            commits.push(GitCommit {
                hash: chunk[0].to_string(),
                short_hash: chunk[1].to_string(),
                message: chunk[2].to_string(),
                author: chunk[3].to_string(),
                date: chunk[4].to_string(),
            });
        }
    }

    Ok(commits)
}

/// Get unified diff (staged or unstaged).
#[tauri::command]
pub async fn git_diff(workspace_path: String, staged: bool) -> Result<String, String> {
    let mut args = vec!["diff"];
    if staged {
        args.push("--cached");
    }

    let output = Command::new("git")
        .args(&args)
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// List local and remote branches.
#[tauri::command]
pub async fn git_branch_list(workspace_path: String) -> Result<Vec<GitBranch>, String> {
    let output = Command::new("git")
        .args(["branch", "-a", "--no-color"])
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let branches = stdout
        .lines()
        .map(|line| {
            let is_current = line.starts_with("* ");
            let name = line.trim_start_matches("* ").trim().to_string();
            let is_remote = name.starts_with("remotes/");
            GitBranch {
                name: name.trim_start_matches("remotes/").to_string(),
                is_current,
                is_remote,
            }
        })
        .filter(|b| !b.name.contains("->"))
        .collect();

    Ok(branches)
}

/// Commit staged changes with a message.
#[tauri::command]
pub async fn git_commit(workspace_path: String, message: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["commit", "-m", &message])
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// Checkout a branch.
#[tauri::command]
pub async fn git_checkout(workspace_path: String, branch: String) -> Result<(), String> {
    let output = Command::new("git")
        .args(["checkout", &branch])
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

/// Convert porcelain v2 status character to human-readable status.
fn char_to_status(c: char) -> String {
    match c {
        'M' => "modified",
        'A' => "added",
        'D' => "deleted",
        'R' => "renamed",
        'C' => "copied",
        'T' => "type-changed",
        _ => "unknown",
    }
    .to_string()
}

/// Parse git porcelain v2 output into GitStatus (extracted for testability).
pub fn parse_porcelain_v2(output: &str) -> GitStatus {
    let mut branch = String::new();
    let mut ahead = 0u32;
    let mut behind = 0u32;
    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();

    for line in output.lines() {
        if line.starts_with("# branch.head ") {
            branch = line.strip_prefix("# branch.head ").unwrap_or("").to_string();
        } else if line.starts_with("# branch.ab ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                ahead = parts[2].trim_start_matches('+').parse().unwrap_or(0);
                behind = parts[3].trim_start_matches('-').parse().unwrap_or(0);
            }
        } else if line.starts_with("1 ") || line.starts_with("2 ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 9 {
                let xy = parts[1];
                let file_path = parts.last().unwrap_or(&"").to_string();
                let x = xy.chars().next().unwrap_or('.');
                let y = xy.chars().nth(1).unwrap_or('.');

                if x != '.' {
                    staged.push(FileChange {
                        path: file_path.clone(),
                        status: char_to_status(x),
                    });
                }
                if y != '.' {
                    unstaged.push(FileChange {
                        path: file_path,
                        status: char_to_status(y),
                    });
                }
            }
        } else if line.starts_with("? ") {
            let file_path = line.strip_prefix("? ").unwrap_or("").to_string();
            untracked.push(file_path);
        }
    }

    GitStatus {
        branch,
        ahead,
        behind,
        staged,
        unstaged,
        untracked,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_char_to_status() {
        assert_eq!(char_to_status('M'), "modified");
        assert_eq!(char_to_status('A'), "added");
        assert_eq!(char_to_status('D'), "deleted");
        assert_eq!(char_to_status('R'), "renamed");
        assert_eq!(char_to_status('C'), "copied");
        assert_eq!(char_to_status('T'), "type-changed");
        assert_eq!(char_to_status('X'), "unknown");
    }

    #[test]
    fn test_parse_porcelain_v2_branch_info() {
        let output = "# branch.oid abc123\n# branch.head main\n# branch.upstream origin/main\n# branch.ab +3 -1\n";
        let status = parse_porcelain_v2(output);
        assert_eq!(status.branch, "main");
        assert_eq!(status.ahead, 3);
        assert_eq!(status.behind, 1);
    }

    #[test]
    fn test_parse_porcelain_v2_staged_and_unstaged() {
        let output = "# branch.head feat/test\n1 M. N... 100644 100644 100644 abc123 def456 src/main.rs\n1 .M N... 100644 100644 100644 abc123 def456 src/lib.rs\n";
        let status = parse_porcelain_v2(output);
        assert_eq!(status.staged.len(), 1);
        assert_eq!(status.staged[0].path, "src/main.rs");
        assert_eq!(status.staged[0].status, "modified");
        assert_eq!(status.unstaged.len(), 1);
        assert_eq!(status.unstaged[0].path, "src/lib.rs");
        assert_eq!(status.unstaged[0].status, "modified");
    }

    #[test]
    fn test_parse_porcelain_v2_untracked() {
        let output = "# branch.head main\n? new_file.txt\n? another.rs\n";
        let status = parse_porcelain_v2(output);
        assert_eq!(status.untracked, vec!["new_file.txt", "another.rs"]);
    }

    #[test]
    fn test_parse_porcelain_v2_empty() {
        let status = parse_porcelain_v2("");
        assert_eq!(status.branch, "");
        assert_eq!(status.ahead, 0);
        assert_eq!(status.behind, 0);
        assert!(status.staged.is_empty());
        assert!(status.unstaged.is_empty());
        assert!(status.untracked.is_empty());
    }

    #[test]
    fn test_parse_porcelain_v2_detached_head() {
        let output = "# branch.head (detached)\n# branch.oid abc123\n";
        let status = parse_porcelain_v2(output);
        assert_eq!(status.branch, "(detached)");
    }

    #[test]
    fn test_parse_porcelain_v2_added_file() {
        let output = "# branch.head main\n1 A. N... 000000 100644 100644 0000000 abc1234 new_file.ts\n";
        let status = parse_porcelain_v2(output);
        assert_eq!(status.staged.len(), 1);
        assert_eq!(status.staged[0].status, "added");
    }
}
