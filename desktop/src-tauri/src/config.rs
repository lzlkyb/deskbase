//! 应用配置：JSON 文件持久化，落在 `app_config_dir()/config.json`。
//!
//! 为何用 JSON 文件而不是 SQLite：壳子不预设业务需要关系库；JSON 足够表达
//! 「少量键值 + 少量结构化字段」，且省掉 rusqlite(bundled) 的编译时间与体积。
//! 业务真需要数据库时，在此模块旁新增 `db.rs`（参考 cc-bridge 的 rusqlite 用法），
//! 不要把配置也搬进去——配置是启动时第一件要读的东西，越简单越可靠。
//!
//! 硬性规则：
//! - **字段只增不改不删语义**：老版本读新配置时未知字段忽略（serde 默认行为），
//!   所以新增字段必须带 `#[serde(default)]`，否则升级后旧配置文件反序列化直接失败。
//! - 写盘用「临时文件 + rename」：半截配置写坏比没有配置更致命。

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// 应用配置。字段即「跨重启需要记住的设置」；一次性状态不要放这里。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// 关窗时释放界面内存（销毁 webview 进程组，实测省约 80MB 专用工作集；
    /// 代价是重开窗口要重新加载前端 1~2 秒）。由托盘/双击图标重建窗口。
    #[serde(default = "default_true")]
    pub release_webview_on_close: bool,
    /// 开机自启（与 tauri-plugin-autostart 同步的镜像值，供前端读取）。
    #[serde(default)]
    pub autostart_enabled: bool,
}

fn default_true() -> bool {
    true
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            release_webview_on_close: true,
            autostart_enabled: false,
        }
    }
}

/// 配置文件路径：`{config_dir}/config.json`。
pub fn config_path(config_dir: &std::path::Path) -> PathBuf {
    config_dir.join("config.json")
}

/// 读配置；文件不存在或损坏时回落默认值（损坏时留警告，不静默）。
pub fn load_config(config_dir: &std::path::Path) -> AppConfig {
    let path = config_path(config_dir);
    match std::fs::read_to_string(&path) {
        Ok(text) => match serde_json::from_str::<AppConfig>(&text) {
            Ok(cfg) => cfg,
            Err(e) => {
                log::warn!("配置文件损坏，使用默认值（{path:?}: {e}）");
                AppConfig::default()
            }
        },
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => AppConfig::default(),
        Err(e) => {
            log::warn!("读取配置失败，使用默认值（{path:?}: {e}）");
            AppConfig::default()
        }
    }
}

/// 写配置：先写临时文件再 rename，避免半截文件。
pub fn save_config(config_dir: &std::path::Path, cfg: &AppConfig) -> Result<(), String> {
    let path = config_path(config_dir);
    let tmp = path.with_extension("json.tmp");
    let text = serde_json::to_string_pretty(cfg).map_err(|e| format!("序列化配置失败: {e}"))?;
    std::fs::write(&tmp, text).map_err(|e| format!("写临时配置失败: {e}"))?;
    std::fs::rename(&tmp, &path).map_err(|e| format!("替换配置失败: {e}"))?;
    Ok(())
}
