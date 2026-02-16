use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::time::SystemTime;

/// File entry returned by directory listing.
#[derive(Debug, Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: Option<u64>,
}

/// File content with detected language.
#[derive(Debug, Serialize)]
pub struct FileContent {
    pub content: String,
    pub language: String,
    pub truncated: bool,
}

/// List directory entries with metadata.
#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir = PathBuf::from(&path);
    if !dir.is_dir() {
        return Err(format!("Not a directory: {}", path));
    }

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(&dir).map_err(|e| e.to_string())?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        let is_hidden = name.starts_with('.');

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(SystemTime::UNIX_EPOCH).ok())
            .map(|d| d.as_secs());

        entries.push(FileEntry {
            name,
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            is_hidden,
            size: metadata.len(),
            modified,
        });
    }

    entries.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}

/// Read a text file up to 1MB, returning content with detected language.
#[tauri::command]
pub fn read_file(path: String) -> Result<FileContent, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.is_file() {
        return Err(format!("Not a file: {}", path));
    }

    let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
    let max_size: u64 = 1_048_576; // 1MB
    let truncated = metadata.len() > max_size;

    let content = if truncated {
        let bytes = fs::read(&file_path).map_err(|e| e.to_string())?;
        String::from_utf8_lossy(&bytes[..max_size as usize]).to_string()
    } else {
        fs::read_to_string(&file_path).map_err(|e| e.to_string())?
    };

    let language = detect_language(&file_path);

    Ok(FileContent {
        content,
        language,
        truncated,
    })
}

/// Check if a file or directory exists.
#[tauri::command]
pub fn file_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

/// Get the user's home directory.
#[tauri::command]
pub fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

/// Detect programming language from file extension.
pub fn detect_language(path: &PathBuf) -> String {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    match ext {
        "rs" => "rust",
        "ts" | "tsx" => "typescript",
        "js" | "jsx" | "mjs" | "cjs" => "javascript",
        "py" => "python",
        "rb" => "ruby",
        "go" => "go",
        "java" => "java",
        "c" | "h" => "c",
        "cpp" | "cc" | "cxx" | "hpp" => "cpp",
        "cs" => "csharp",
        "swift" => "swift",
        "kt" | "kts" => "kotlin",
        "md" | "mdx" => "markdown",
        "json" => "json",
        "yaml" | "yml" => "yaml",
        "toml" => "toml",
        "html" | "htm" => "html",
        "css" => "css",
        "scss" | "sass" => "scss",
        "sql" => "sql",
        "sh" | "bash" | "zsh" => "shell",
        "dockerfile" | "Dockerfile" => "dockerfile",
        "xml" => "xml",
        "svg" => "svg",
        _ => "plaintext",
    }
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_language_common_types() {
        assert_eq!(detect_language(&PathBuf::from("main.rs")), "rust");
        assert_eq!(detect_language(&PathBuf::from("app.tsx")), "typescript");
        assert_eq!(detect_language(&PathBuf::from("app.ts")), "typescript");
        assert_eq!(detect_language(&PathBuf::from("index.js")), "javascript");
        assert_eq!(detect_language(&PathBuf::from("script.py")), "python");
        assert_eq!(detect_language(&PathBuf::from("config.json")), "json");
        assert_eq!(detect_language(&PathBuf::from("config.yaml")), "yaml");
        assert_eq!(detect_language(&PathBuf::from("config.yml")), "yaml");
        assert_eq!(detect_language(&PathBuf::from("Cargo.toml")), "toml");
        assert_eq!(detect_language(&PathBuf::from("README.md")), "markdown");
        assert_eq!(detect_language(&PathBuf::from("style.css")), "css");
        assert_eq!(detect_language(&PathBuf::from("index.html")), "html");
        assert_eq!(detect_language(&PathBuf::from("run.sh")), "shell");
    }

    #[test]
    fn test_detect_language_unknown() {
        assert_eq!(detect_language(&PathBuf::from("file.xyz")), "plaintext");
        assert_eq!(detect_language(&PathBuf::from("Makefile")), "plaintext");
    }

    #[test]
    fn test_list_directory_not_a_dir() {
        let result = list_directory("/nonexistent/path/12345".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_list_directory_real() {
        // List the src-tauri/src directory (known to exist)
        let result = list_directory(env!("CARGO_MANIFEST_DIR").to_string());
        assert!(result.is_ok());
        let entries = result.unwrap();
        // Should contain at least Cargo.toml and src/
        assert!(entries.iter().any(|e| e.name == "src"));
        assert!(entries.iter().any(|e| e.name == "Cargo.toml"));
        // Directories should sort before files
        let first_file_idx = entries.iter().position(|e| !e.is_dir);
        let last_dir_idx = entries.iter().rposition(|e| e.is_dir);
        if let (Some(ff), Some(ld)) = (first_file_idx, last_dir_idx) {
            assert!(ld < ff, "Directories should come before files");
        }
    }

    #[test]
    fn test_file_exists() {
        assert!(file_exists(env!("CARGO_MANIFEST_DIR").to_string()));
        assert!(!file_exists("/nonexistent/path/xyz".to_string()));
    }

    #[test]
    fn test_read_file_not_a_file() {
        let result = read_file(env!("CARGO_MANIFEST_DIR").to_string());
        assert!(result.is_err());
    }
}
