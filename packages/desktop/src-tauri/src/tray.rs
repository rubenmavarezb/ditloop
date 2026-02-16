use tauri::{
    image::Image,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Emitter, Manager, Runtime,
};

/// Build and register the system tray icon with context menu.
pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<TrayIcon<R>> {
    let show_hide = MenuItem::with_id(app, "show_hide", "Show DitLoop", true, None::<&str>)?;
    let separator1 = PredefinedMenuItem::separator(app)?;
    let active_execs = MenuItem::with_id(app, "active_execs", "Active Executions: 0", false, None::<&str>)?;
    let pending_approvals = MenuItem::with_id(app, "pending_approvals", "Pending Approvals: 0", false, None::<&str>)?;
    let separator2 = PredefinedMenuItem::separator(app)?;
    let new_execution = MenuItem::with_id(app, "new_execution", "New Execution...", true, None::<&str>)?;
    let open_workspace = MenuItem::with_id(app, "open_workspace", "Open Workspace...", true, None::<&str>)?;
    let separator3 = PredefinedMenuItem::separator(app)?;
    let preferences = MenuItem::with_id(app, "preferences", "Preferences...", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit DitLoop", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show_hide,
            &separator1,
            &active_execs,
            &pending_approvals,
            &separator2,
            &new_execution,
            &open_workspace,
            &separator3,
            &preferences,
            &quit,
        ],
    )?;

    let icon = Image::from_bytes(include_bytes!("../icons/32x32.png"))?;

    let tray = TrayIconBuilder::with_id("ditloop-tray")
        .icon(icon)
        .menu(&menu)
        .tooltip("DitLoop")
        .on_menu_event(move |app, event| {
            let id = event.id().as_ref();
            match id {
                "show_hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
                "new_execution" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("tray:navigate", "/executions");
                    }
                }
                "open_workspace" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("tray:navigate", "/");
                    }
                }
                "preferences" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("tray:navigate", "/settings");
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(tray)
}

/// Update tray menu counts by rebuilding the menu with new values.
#[tauri::command]
pub fn update_tray_counts(
    app: AppHandle,
    active_executions: u32,
    pending_approvals: u32,
) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("ditloop-tray") {
        let show_hide = MenuItem::with_id(&app, "show_hide", "Show DitLoop", true, None::<&str>).map_err(|e| e.to_string())?;
        let separator1 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let active_execs = MenuItem::with_id(&app, "active_execs", format!("Active Executions: {}", active_executions), false, None::<&str>).map_err(|e| e.to_string())?;
        let pending = MenuItem::with_id(&app, "pending_approvals", format!("Pending Approvals: {}", pending_approvals), false, None::<&str>).map_err(|e| e.to_string())?;
        let separator2 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let new_execution = MenuItem::with_id(&app, "new_execution", "New Execution...", true, None::<&str>).map_err(|e| e.to_string())?;
        let open_workspace = MenuItem::with_id(&app, "open_workspace", "Open Workspace...", true, None::<&str>).map_err(|e| e.to_string())?;
        let separator3 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let preferences = MenuItem::with_id(&app, "preferences", "Preferences...", true, None::<&str>).map_err(|e| e.to_string())?;
        let quit = MenuItem::with_id(&app, "quit", "Quit DitLoop", true, None::<&str>).map_err(|e| e.to_string())?;

        let menu = Menu::with_items(
            &app,
            &[
                &show_hide, &separator1, &active_execs, &pending,
                &separator2, &new_execution, &open_workspace,
                &separator3, &preferences, &quit,
            ],
        ).map_err(|e| e.to_string())?;

        let _ = tray.set_menu(Some(menu));
    }
    Ok(())
}
