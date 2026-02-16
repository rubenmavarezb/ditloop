use serde::Deserialize;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

/// Notification event type matching server WebSocket events.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationType {
    ApprovalRequested,
    ExecutionCompleted,
    ExecutionFailed,
    ExecutionStarted,
}

/// Send a native OS notification for a DitLoop event.
#[tauri::command]
pub fn send_notification(
    app: AppHandle,
    notification_type: NotificationType,
    title: String,
    body: String,
) -> Result<(), String> {
    let icon = match notification_type {
        NotificationType::ApprovalRequested => "tray-attention",
        NotificationType::ExecutionCompleted => "tray-idle",
        NotificationType::ExecutionFailed => "tray-attention",
        NotificationType::ExecutionStarted => "tray-running",
    };

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .icon(icon)
        .show()
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Check if the app has notification permission.
#[tauri::command]
pub fn check_notification_permission(app: AppHandle) -> Result<bool, String> {
    let result = app
        .notification()
        .permission_state()
        .map_err(|e| e.to_string())?;

    Ok(matches!(result, tauri_plugin_notification::PermissionState::Granted))
}

/// Request notification permission from the OS.
#[tauri::command]
pub fn request_notification_permission(app: AppHandle) -> Result<bool, String> {
    let result = app
        .notification()
        .request_permission()
        .map_err(|e| e.to_string())?;

    Ok(matches!(result, tauri_plugin_notification::PermissionState::Granted))
}
