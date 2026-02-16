mod commands;
mod notifications;
mod tray;

/// Run the Tauri application with all plugins registered.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            tray::create_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            tray::update_tray_counts,
            notifications::send_notification,
            notifications::check_notification_permission,
            notifications::request_notification_permission,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DitLoop desktop");
}
