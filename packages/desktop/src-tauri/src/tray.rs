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
    let workspace_count = MenuItem::with_id(app, "workspace_count", "Workspaces: 0", false, None::<&str>)?;
    let separator2 = PredefinedMenuItem::separator(app)?;
    let open_workspace = MenuItem::with_id(app, "open_workspace", "Open Workspace...", true, None::<&str>)?;
    let open_files = MenuItem::with_id(app, "open_files", "Browse Files...", true, None::<&str>)?;
    let separator3 = PredefinedMenuItem::separator(app)?;
    let preferences = MenuItem::with_id(app, "preferences", "Settings...", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit DitLoop", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show_hide,
            &separator1,
            &workspace_count,
            &separator2,
            &open_workspace,
            &open_files,
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
                "open_workspace" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("tray:navigate", "/");
                    }
                }
                "open_files" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("tray:navigate", "/files");
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

/// Update tray menu with workspace count.
#[tauri::command]
pub fn update_tray_counts(
    app: AppHandle,
    workspace_count: u32,
) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("ditloop-tray") {
        let show_hide = MenuItem::with_id(&app, "show_hide", "Show DitLoop", true, None::<&str>).map_err(|e| e.to_string())?;
        let separator1 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let ws_count = MenuItem::with_id(&app, "workspace_count", format!("Workspaces: {}", workspace_count), false, None::<&str>).map_err(|e| e.to_string())?;
        let separator2 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let open_workspace = MenuItem::with_id(&app, "open_workspace", "Open Workspace...", true, None::<&str>).map_err(|e| e.to_string())?;
        let open_files = MenuItem::with_id(&app, "open_files", "Browse Files...", true, None::<&str>).map_err(|e| e.to_string())?;
        let separator3 = PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?;
        let preferences = MenuItem::with_id(&app, "preferences", "Settings...", true, None::<&str>).map_err(|e| e.to_string())?;
        let quit = MenuItem::with_id(&app, "quit", "Quit DitLoop", true, None::<&str>).map_err(|e| e.to_string())?;

        let menu = Menu::with_items(
            &app,
            &[
                &show_hide, &separator1, &ws_count,
                &separator2, &open_workspace, &open_files,
                &separator3, &preferences, &quit,
            ],
        ).map_err(|e| e.to_string())?;

        let _ = tray.set_menu(Some(menu));
    }
    Ok(())
}
