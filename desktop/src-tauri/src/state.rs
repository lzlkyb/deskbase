//! 应用共享状态（Tauri Managed State）。
//!
//! 范式：`main.rs` 里 `app.manage(Arc::new(AppState::new(...)))`，命令里用
//! `tauri::State<Arc<AppState>>` 取。配置用 `tokio::sync::RwLock` 包着——
//! 读多写少，且同步回调里只能用 `try_read()`。
//!
//! 业务加状态时在此文件加字段（如 `db: tokio::sync::Mutex<Connection>`），
//! 不要散着用全局 static——全局static 在测试里互相污染，且没有生命周期管理。

use std::sync::Arc;

use tokio::sync::RwLock;

use crate::config::AppConfig;

pub struct AppState {
    /// 应用配置（跨重启持久化，见 config.rs）。
    pub config: RwLock<AppConfig>,
    /// 配置目录（`{config_dir}`，与 data_dir 相同）。
    pub config_dir: std::path::PathBuf,
    /// 供 notifications feature 关闭时也能注入的 AppHandle 存根。
    /// 需要发桌面通知的代码统一走 main.rs 的 `notify_toast`（那里按 feature 门控），
    /// 不要直接持有 AppHandle 到处发。
    pub app_handle: std::sync::Mutex<Option<tauri::AppHandle>>,
}

impl AppState {
    pub fn new(config: AppConfig, config_dir: std::path::PathBuf) -> Arc<Self> {
        Arc::new(Self {
            config: RwLock::new(config),
            config_dir,
            app_handle: std::sync::Mutex::new(None),
        })
    }
}
