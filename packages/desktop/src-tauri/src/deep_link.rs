use tauri::{AppHandle, Emitter, Manager};

/// Handle incoming deep link URLs (ditloop:// protocol).
pub fn handle_deep_link(app: &AppHandle, urls: Vec<url::Url>) {
    for url in urls {
        let path = url.path().trim_start_matches('/');
        let route = match url.host_str() {
            Some("workspace") => format!("/workspace/{}", path),
            Some("approval") => format!("/approvals/{}", path),
            Some("execution") => format!("/executions/{}", path),
            Some("connect") => {
                // Emit connection params to frontend
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("deep-link:connect", url.to_string());
                }
                return;
            }
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
