//! 系统类命令：自启、配置读写、安装信息。**壳子级通用件，与业务无关。**
//!
//! 这些命令演示了三种典型模式，新命令照抄即可：
//! 1. **托管状态读写**（`get_config` / `save_config`）：`State<Arc<AppState>>` + RwLock；
//! 2. **插件调用**（`set_autostart`）：tauri 插件在 Rust 侧的用法；
//! 3. **只读环境信息**（`install_dir`）：路径解析。

use std::sync::Arc;

use crate::config::AppConfig;
use crate::state::AppState;

/// 读当前配置（启动后可能已被 save_config 改过，以内存为准）。
#[tauri::command]
pub async fn get_config(state: tauri::State<'_, Arc<AppState>>) -> Result<AppConfig, String> {
    Ok(state.config.read().await.clone())
}

/// 保存配置：写内存 + 落盘（落盘失败也返回 Err，不让「改了没生效」静默发生）。
#[tauri::command]
pub async fn save_config(
    state: tauri::State<'_, Arc<AppState>>,
    config: AppConfig,
) -> Result<(), String> {
    crate::config::save_config(&state.config_dir, &config)?;
    *state.config.write().await = config;
    Ok(())
}

/// 开机自启状态。
#[tauri::command]
pub fn get_autostart(app: tauri::AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .is_enabled()
        .map_err(|e| format!("读取自启状态失败: {e}"))
}

/// 设置开机自启。
#[tauri::command]
pub fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let al = app.autolaunch();
    if enabled {
        al.enable().map_err(|e| format!("开启自启失败: {e}"))
    } else {
        al.disable().map_err(|e| format!("关闭自启失败: {e}"))
    }
}

/// 安装目录（NSIS 安装版即 exe 所在目录；dev 下为目标目录）。
#[tauri::command]
pub fn install_dir() -> Result<String, String> {
    let exe = std::env::current_exe().map_err(|e| format!("定位可执行文件失败: {e}"))?;
    let dir = exe.parent().ok_or_else(|| "无法解析安装目录".to_string())?;
    Ok(dir.to_string_lossy().to_string())
}

/// 应用信息（版本 / 平台）。版本取 Cargo.toml 真源（env! 编译期常量）。
/// 前端关于卡、侧栏版本徽章都用它——不要在 package.json 再维护一份。
#[tauri::command]
pub fn get_app_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS,
    }))
}

/// 在系统文件管理器中揭示安装目录。
#[tauri::command]
pub fn reveal_install_dir(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    let dir = std::env::current_exe()
        .map_err(|e| format!("定位可执行文件失败: {e}"))?
        .parent()
        .ok_or_else(|| "无法解析安装目录".to_string())?
        .to_path_buf();
    app.opener()
        .open_path(dir.to_string_lossy(), None::<&str>)
        .map_err(|e| format!("打开目录失败: {e}"))
}

/// 用系统默认浏览器打开外部链接。
#[tauri::command]
pub fn open_external(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| format!("打开链接失败: {e}"))
}
