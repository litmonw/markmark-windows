/// Copy the given text to the system clipboard.
///
/// On Windows, delegates to PowerShell's `Set-Clipboard` which reliably handles
/// the OS clipboard even when it is locked by another process.  On macOS and
/// Linux, pipes the text into `pbcopy` / `xclip` respectively.
#[tauri::command]
pub async fn copy_to_clipboard(text: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = tokio::process::Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "Set-Clipboard",
                "-Value",
            ])
            .arg(&text)
            .output()
            .await
            .map_err(|e| format!("Failed to spawn clipboard process: {e}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!(
                "PowerShell Set-Clipboard failed: {}",
                stderr.trim()
            ));
        }
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        use tokio::io::AsyncWriteExt;

        let mut child = tokio::process::Command::new("pbcopy")
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn pbcopy: {e}"))?;

        if let Some(mut stdin) = child.stdin.take() {
            stdin
                .write_all(text.as_bytes())
                .await
                .map_err(|e| format!("Failed to write to pbcopy stdin: {e}"))?;
        }

        let status = child
            .wait()
            .await
            .map_err(|e| format!("Failed to wait for pbcopy: {e}"))?;

        if !status.success() {
            return Err("pbcopy exited with non-zero status".to_string());
        }
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        use tokio::io::AsyncWriteExt;

        let mut child = tokio::process::Command::new("xclip")
            .args(["-selection", "clipboard"])
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn xclip: {e}"))?;

        if let Some(mut stdin) = child.stdin.take() {
            stdin
                .write_all(text.as_bytes())
                .await
                .map_err(|e| format!("Failed to write to xclip stdin: {e}"))?;
        }

        let status = child
            .wait()
            .await
            .map_err(|e| format!("Failed to wait for xclip: {e}"))?;

        if !status.success() {
            return Err("xclip exited with non-zero status".to_string());
        }
        Ok(())
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        let _ = text;
        Err("Clipboard not supported on this platform".to_string())
    }
}
