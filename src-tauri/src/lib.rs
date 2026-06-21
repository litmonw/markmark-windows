mod commands;

use commands::fs::{
    create_file, delete_file, get_file_info, open_directory, read_file, rename_file, write_file,
};
use commands::clipboard::copy_to_clipboard;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_directory,
            read_file,
            write_file,
            create_file,
            rename_file,
            delete_file,
            get_file_info,
            copy_to_clipboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
