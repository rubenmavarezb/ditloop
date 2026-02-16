pub mod ai_cli;
pub mod config;
pub mod filesystem;
pub mod git;
pub mod server;
pub mod workspace;

/// Placeholder command for testing IPC between frontend and Rust backend.
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to DitLoop Desktop.", name)
}
