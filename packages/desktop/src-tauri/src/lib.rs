mod commands;
mod deep_link;
mod notifications;
mod tray;

use tauri_plugin_deep_link::DeepLinkExt;

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

            // Register deep link handler
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                deep_link::handle_deep_link(&handle, event.urls().to_vec());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::filesystem::list_directory,
            commands::filesystem::read_file,
            commands::filesystem::file_exists,
            commands::filesystem::get_home_dir,
            commands::workspace::detect_workspaces,
            commands::workspace::get_workspace_info,
            commands::workspace::open_in_terminal,
            commands::workspace::open_in_editor,
            commands::server::detect_local_server,
            commands::server::health_check,
            commands::git::git_status,
            commands::git::git_log,
            commands::git::git_diff,
            commands::git::git_branch_list,
            commands::git::git_commit,
            commands::git::git_checkout,
            commands::ai_cli::detect_ai_tools,
            commands::ai_cli::launch_ai_cli,
            commands::ai_cli::inject_context,
            tray::update_tray_counts,
            notifications::send_notification,
            notifications::check_notification_permission,
            notifications::request_notification_permission,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DitLoop desktop");
}
