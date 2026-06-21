use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

/// Extensions displayed as Markdown in the directory tree (includes .txt).
const TREE_DISPLAY_EXTENSIONS: &[&str] = &["md", "markdown", "mdown", "mkd", "txt"];

/// A file or directory node in the file tree.
#[derive(Debug, Clone, Serialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<FileNode>>,
    pub extension: Option<String>,
    pub size: u64,
    pub modified: Option<u64>,
}

/// Metadata returned by `get_file_info`.
#[derive(Debug, Clone, Serialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub extension: Option<String>,
    pub size: u64,
    pub modified: Option<u64>,
    pub created: Option<u64>,
    pub is_readonly: bool,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Returns the lowercase extension of a path, or `None` if there is none.
fn extension_of(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
}

/// Returns `true` when the extension should be shown in the tree as Markdown
/// (incl. `.txt`).
fn is_tree_display_extension(path: &Path) -> bool {
    extension_of(path)
        .map(|ext| TREE_DISPLAY_EXTENSIONS.contains(&ext.as_str()))
        .unwrap_or(false)
}

/// Convert a `SystemTime` to seconds since the Unix epoch.
fn system_time_to_unix_secs(time: std::time::SystemTime) -> Option<u64> {
    time.duration_since(UNIX_EPOCH).ok().map(|d| d.as_secs())
}

/// Recursively scan a directory, returning a sorted `Vec<FileNode>`.
///
/// Sorting: directories first, then alphabetical (case-insensitive) within
/// each group.  Only Markdown files (`.md`, `.markdown`, `.mdown`, `.mkd`,
/// `.txt`) are included; directories are always included.
fn scan_directory(dir: &Path) -> Result<Vec<FileNode>, String> {
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {e}"))?;

    let mut nodes: Vec<FileNode> = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {e}"))?;
        let path = entry.path();
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("Failed to read metadata for {}: {e}", path.display()))?;

        let name = entry
            .file_name()
            .to_string_lossy()
            .into_owned();

        if metadata.is_dir() {
            let children = scan_directory(&path)?;
            nodes.push(FileNode {
                name,
                path: path.to_string_lossy().into_owned(),
                is_directory: true,
                children: Some(children),
                extension: None,
                size: 0,
                modified: metadata
                    .modified()
                    .ok()
                    .and_then(system_time_to_unix_secs),
            });
        } else {
            // Skip non-Markdown files.
            if !is_tree_display_extension(&path) {
                continue;
            }
            nodes.push(FileNode {
                name,
                path: path.to_string_lossy().into_owned(),
                is_directory: false,
                children: None,
                extension: extension_of(&path),
                size: metadata.len(),
                modified: metadata
                    .modified()
                    .ok()
                    .and_then(system_time_to_unix_secs),
            });
        }
    }

    // Sort: directories first, then case-insensitive alphabetical.
    nodes.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(nodes)
}

/// Build the parent path for a rename operation.
fn sibling_path(original: &Path, new_name: &str) -> PathBuf {
    let parent = original.parent().unwrap_or(Path::new(""));
    parent.join(new_name)
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

/// Scan a directory and return the recursive file tree.
#[tauri::command]
pub async fn open_directory(path: String) -> Result<Vec<FileNode>, String> {
    let dir = PathBuf::from(&path);
    if !dir.is_dir() {
        return Err(format!("Path is not a directory: {path}"));
    }
    scan_directory(&dir)
}

/// Read a file as a UTF-8 string.
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {e}"))
}

/// Write a UTF-8 string to a file (overwriting existing contents).
#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {e}"))
}

/// Create an empty file at the given path.
#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    // Open with create + truncate to ensure the file exists and is empty.
    fs::File::create(&path).map_err(|e| format!("Failed to create file: {e}"))?;
    Ok(())
}

/// Rename a file or directory. `new_name` is the new file/directory name only
/// (not a full path).
#[tauri::command]
pub async fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    let new = sibling_path(&old, &new_name);

    if new.exists() {
        return Err(format!(
            "A file or directory already exists at: {}",
            new.display()
        ));
    }

    fs::rename(&old, &new)
        .map_err(|e| format!("Failed to rename: {e}"))?;

    Ok(new.to_string_lossy().into_owned())
}

/// Move a file or directory to the system recycle bin / trash.
#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    trash::delete(&path).map_err(|e| format!("Failed to move to trash: {e}"))
}

/// Return metadata about a file or directory.
#[tauri::command]
pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
    let p = PathBuf::from(&path);
    let metadata = fs::metadata(&p).map_err(|e| format!("Failed to read metadata: {e}"))?;

    let name = p
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();

    Ok(FileInfo {
        name,
        path: p.to_string_lossy().into_owned(),
        is_directory: metadata.is_dir(),
        extension: extension_of(&p),
        size: metadata.len(),
        modified: metadata.modified().ok().and_then(system_time_to_unix_secs),
        created: metadata.created().ok().and_then(system_time_to_unix_secs),
        is_readonly: metadata.permissions().readonly(),
    })
}
