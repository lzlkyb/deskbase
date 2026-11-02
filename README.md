# Deskbase

[![CI](https://github.com/lzlkyb/deskbase/actions/workflows/build.yml/badge.svg)](https://github.com/lzlkyb/deskbase/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/github/v/release/lzlkyb/deskbase)](https://github.com/lzlkyb/deskbase/releases)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white)](https://tauri.app)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-stable-DEA584?logo=rust&logoColor=black)](https://www.rust-lang.org)

**A production-proven Tauri 2 desktop app template — copy it, rename it, ship it.**

Deskbase is an open-source desktop application shell (boilerplate / starter) built with
**Tauri 2 + React 18 + TypeScript + Rust**. It is not a hello-world toy: every line is
extracted from a production desktop app that ships auto-updates to real users. Copy the
repo, run one rename command, and in ten minutes you have a running desktop app with
**signed auto-updates, a complete design system, and CI that builds Windows + macOS releases**.

---

## Screenshots

| Workbench (rename preview) | Your app, right after renaming |
|:--:|:--:|
| ![Deskbase workbench](docs/screenshots/workbench-dark.png) | ![App home](docs/screenshots/app-home.png) |

| Motion system — dark | Motion system — light |
|:--:|:--:|
| ![Motion preview dark](docs/screenshots/motion-dark.png) | ![Motion preview light](docs/screenshots/motion-light.png) |

---

## Why Deskbase

Most desktop templates get you a window. Deskbase gets you the parts that actually cost
weeks in production:

- **🔐 Signed auto-update that survives the real world.** Single-flight guard, exponential
  backoff, multi-endpoint fallback, typed error classification, cross-platform
  `updater.json` merging, and a one-command release chain (`npm run release`) that tags,
  builds on CI, and publishes. Includes a local fake-update-server for end-to-end testing
  without deploying anything.
- **🎨 A design system, not a CSS file.** Design tokens with light/dark themes and
  classic/glass materials, 30+ accessible UI components (button, card, switch, modal, menu,
  toast, badge…), a layout shell (drag region, tray-aware header), and a motion system with
  three duration tiers, unified easing, and a `prefers-reduced-motion` guard — verified by
  real-browser regression tests, not vibes.
- **🧱 Desktop-correct app skeleton.** System tray, single-instance lock, window
  destroy/recreate (~80 MB saved when hidden), DWM rounded corners, command layering,
  path-whitelist security primitives, and JSON config persistence.
- **🤖 Machine-enforced discipline.** Seven local gates run on every push (component size,
  fmt, eslint, tsc, vitest, clippy, cargo test). CI mirrors them. Version numbers have a
  single source of truth. The template holds itself to the standard it teaches.
- **📦 Tiny.** The NSIS installer is ~3.2 MB. Adding a dependency requires justifying its
  binary size cost first (red line: 15 MB).

### The three layers

| Layer | What's inside | Where |
|-------|---------------|-------|
| 🎨 UI style architecture | Design tokens (light/dark × classic/glass) + 30+ components + layout shell + motion system | `desktop/src/index.css` `desktop/src/components/ui/` `desktop/src/lib/motion.ts` |
| ⚙️ App architecture | Tray + single instance + window lifecycle + DWM rounding + command layering + path security + JSON config | `desktop/src-tauri/src/main.rs` `desktop/src-tauri/src/commands/` `desktop/src-tauri/src/security/` |
| 🔄 Update architecture | Single-flight + backoff + error classification → frontend state machine → undoable auto-restart → one-command release + cross-platform updater merge + CI | `desktop/src-tauri/src/commands/update.rs` `desktop/src/contexts/UpdateContext.tsx` `desktop/scripts/release.mjs` |

No business code of any kind — that is what your copy is for.

---

## Quick Start

**Prerequisites:** Node 22+, Rust stable, and the
[Tauri 2 system dependencies](https://tauri.app/start/prerequisites/)
(Windows: WebView2 + VS C++ Build Tools; macOS: Xcode CLT).

```bash
# 1. Copy the shell (whole directory; git history optional)
cp -r deskbase my-app && cd my-app/desktop

# 2. Rename everything in one shot: Cargo package/exe name, Rust crate name,
#    tauri.conf.json, package.json, branding.rs tray tips, about.ts, HTML titles,
#    CI artifact names — all ~17 product identifiers, zero misses
node scripts/rename-app.mjs my-tool --repo your-name/my-tool --display "My Tool"

# 3. Replace the placeholder icons in desktop/src-tauri/icons/
#    (npx tauri icon your-logo.png generates the full set; keep public/icon.png in sync)

# 4. Generate your own update signing key pair — the bundled key is a throwaway
#    test key that only exists so `cargo test` runs out of the box
npx tauri signer generate -w ~/.tauri/my-tool.key
#    public key  → desktop/src-tauri/tauri.conf.json → plugins.updater.pubkey
#    private key → GitHub repo Settings → Secrets → TAURI_SIGNING_PRIVATE_KEY
#    also delete the `dangerousInsecureTransportProtocol` flag before publishing

# 5. Run it
npm install
npm run tauri dev
```

> First install failing with `Cannot read properties of null (reading 'edgesOut')`?
> That is a known npm 10.9.x + vitest 4 optional-peer bug. Run
> `npm install --legacy-peer-deps` once to generate the lockfile; every later
> `npm install` / `npm ci` works normally.

After `npm run tauri dev` you get a working app shell: side navigation (home / monitor /
settings), header with drag region + theme toggle + update status, a settings page with
auto-launch and update history, and a tray menu (open / check update / quit).

---

## Repository Layout

```
deskbase/
├── CLAUDE.md                     # Engineering discipline — read before changing code
├── CHANGELOG.md                  # Single hand-written source (Keep a Changelog)
├── .github/workflows/build.yml   # CI: frontend gates + Rust tests + tag dual-platform release
├── .githooks/pre-push             # 7 local gates (enable: git config core.hooksPath .githooks)
└── desktop/
    ├── src/
    │   ├── index.css             # Design token system — read before touching UI
    │   ├── App.tsx               # App skeleton: page table / Ctrl+1~N / transitions
    │   ├── components/
    │   │   ├── ui/               # 30+ primitives (button/card/switch/modal/toast…)
    │   │   ├── layout/           # Header + SideNav (drag region / badges / update slot)
    │   │   ├── update/           # Update UI suite (pill / dialog / progress / undoable restart)
    │   │   └── tabs/             # Example pages: HomeTab / SettingsTab — copy and extend
    │   ├── contexts/UpdateContext.tsx  # Update state machine idle→…→ready→restart
    │   ├── hooks/                # useAppHidden (pause polling while window hidden) etc.
    │   └── lib/                  # Theme / motion / platform / config pure functions
    ├── scripts/                  # Release chain (see below)
    └── src-tauri/
        ├── src/main.rs           # Tray / single instance / window lifecycle / DWM rounding
        ├── src/commands/         # system.rs (config/autostart/open) + update.rs
        ├── src/security/path.rs  # Path whitelist (canonicalize + ancestor walk)
        └── tauri.conf.json       # Product identity / updater endpoints / NSIS config
```

---

## How the Auto-Update Works

```
User clicks "Check for updates"
  → Rust commands/update.rs: single-flight guard (concurrent checks collapse)
      + endpoints tried in order + exponential backoff + classify_update_error codes
  → frontend UpdateContext: idle → checking → available → downloading → ready → error/uptodate
  → user clicks "Restart & install": 8-second undoable countdown → process restart
  → release time: npm run release → tag → CI build-macos → build-windows
      → generate-updater-json.mjs merges platform fragments → updater.json on the Release
      → clients pick up the new version on next check
```

Verify the whole chain locally without deploying:

```bash
# terminal 1: fake update server serving the current NSIS bundle + updater.json
node desktop/scripts/fake-update-server.mjs --dir desktop/src-tauri/target/release/bundle/nsis

# terminal 2: point the dev app at the fake server
APP_UPDATE_ENDPOINT=http://127.0.0.1:8787/updater.json npm run tauri dev
```

---

## Commands

```bash
cd desktop

npm run tauri dev        # dev (frontend HMR; Rust changes need a restart)
npm run vite:build       # frontend only (tsc + vite)
npm test                 # vitest
npm run lint             # eslint (react-hooks rules are the point)
npm run motion:check     # real-browser motion regression (heavy/manual: needs
                         # npx playwright install + vite preview on :1425)

cd src-tauri
cargo clippy --all-targets --no-default-features -- -D warnings
cargo test  --no-default-features   # unit tests + tests/update_flow.rs integration
                                     # (headless "check → download → verify-fail" against a local fake source)

cd desktop && npm run release -- --patch   # release (see "Release flow" in CLAUDE.md)
```

---

## Engineering Discipline

Seven gates run on every push (pre-push hook) and in CI (frontend job):

| # | Gate | Catches |
|---|------|---------|
| 1 | Component size (≤300 lines, ≤8 hooks per file, ratchet baseline) | God components |
| 2 | `cargo fmt --check` | Style drift |
| 3 | `eslint` (react-hooks rules) | Stale closures tsc can't see |
| 4 | `tsc --noEmit` | Type holes |
| 5 | `vitest` | Regressions in pure logic |
| 6 | `cargo clippy -D warnings` | Rust lint debt |
| 7 | `cargo test --no-default-features` | Broken update chain |

Self-checks before you change things: new dependency → justify its binary-size cost
(NSIS ≤ 15 MB red line); new background loop → walk the six-point checklist in
`CLAUDE.md` §8.1 (yield points / producer failure / stream-end signal / per-round cost /
fallback cap / platform-branch verification); UI change → read the real component source
and ship an HTML mockup first.

---

## Lessons Baked In

- Closing a window **destroys** the webview (~80 MB saved) and the tray resurrects it;
  exit goes through `ExitRequested{code: None}`.
- While the window is invisible, polling **must** stop: `useAppHidden` +
  `refetchInterval: false`.
- `updater.json` fragments from macOS and Windows jobs must be **merged**
  (`UPDATER_MERGE_INTO`), never overwrite each other.
- Mirror failures must not be silent: after push, verify the raw URL clients actually
  read and that versions match.
- The 300-line / 8-hook component budget is enforced by
  `check-component-size.mjs` as a ratchet — existing files may shrink, never grow.

---

## 中文简介

Deskbase 是一个开源的 **Tauri 2 桌面应用壳子（模板）**，技术栈为 Tauri 2 + React 18 +
TypeScript + Rust。它不是玩具示例——每一行都抽离自持续发版的生产桌面应用，包含三层经过
验证的架构：

- **软件更新架构**：单飞闸、指数退避、多源回退、错误分类、可撤销自动重启、一键发版链
  （`npm run release`）、CI 双平台构建与跨平台 updater.json 合并，附带本地假更新服务器可
  端到端联调；
- **技术架构**：托盘、单实例、关窗销毁 webview 省约 80MB 内存、DWM 圆角、命令分层、路径
  白名单安全原语、JSON 配置持久化；
- **UI 风格架构**：设计 token（浅/深双主题 × classic/glass 双材质）、30+ 可访问组件、
  layout 壳、三档时长 + 统一 easing + 减弱动效守卫的动效体系（真实浏览器回归测试验证）。

复制一份、跑一条 `rename-app.mjs` 命令（十七处产品标识一次改齐），十分钟得到一个能跑、
能自动更新、UI 成体系的桌面应用。七项本地门禁（体量/eslint/tsc/vitest/fmt/clippy/test）
由机器强制执行，CI 同标准把关。MIT 许可。

---

## Contributing

Issues and PRs welcome. Please keep the gates green (`.githooks/pre-push` runs them all)
and follow the commit prefixes in `CLAUDE.md`.

## License

[MIT](LICENSE) © Deskbase contributors
