use tauri::{AppHandle, Emitter, Manager};

/// Handle incoming deep link URLs (ditloop:// protocol).
///
/// Supports: ditloop://workspace/{name}, ditloop://settings, ditloop://files
/// No token or connection params — desktop is local-first.
pub fn handle_deep_link(app: &AppHandle, urls: Vec<url::Url>) {
    for url in urls {
        let path = url.path().trim_start_matches('/');
        let route = match url.host_str() {
            Some("workspace") => format!("/workspace/{}", path),
            Some("settings") => "/settings".to_string(),
            Some("files") => "/files".to_string(),
            _ => "/".to_string(),
        };

        // Navigate the main window to the route
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = window.emit("deep-link:navigate", route);
        }
    }
}
