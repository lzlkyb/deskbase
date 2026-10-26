//! 应用名的单一来源（显示层）。
//!
//! 为何需要这个文件：把「给人看的名字」与「装在磁盘上的名字」分开，避免同一个应用
//! 两个名字——托盘 tooltip、桌面通知标题、窗口标题用显示名；安装目录、exe 名、
//! bundle identifier、防火墙规则名用标识层（`tauri.conf.json` 的 productName）。
//!
//! 改名时只改这里 + `tauri.conf.json` + `src/lib/about.ts` 三处（或跑
//! `node scripts/rename-app.mjs` 一把改完）。
//!
//! 前端那侧对应 `src/lib/about.ts` 的 `APP_INFO.name`，是同一个字符串的第二份维护
//! （前端拿不到 Rust 常量，只能各存一份）。改这里请同步改那边。

pub const APP_DISPLAY_NAME: &str = "MyApp";

/// 托盘 tooltip 的三条文案。各自嵌着显示名，改 `APP_DISPLAY_NAME` 时编译器不会提醒。
pub const TRAY_TIP_RUNNING: &str = "MyApp · 运行中";
pub const TRAY_TIP_STOPPED: &str = "MyApp · 已停止";
pub const TRAY_TIP_IP_CHANGED: &str = "MyApp: 网络地址已变化，点击查看";
