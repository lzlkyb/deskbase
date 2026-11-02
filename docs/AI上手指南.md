# AI 上手指南：不懂技术，也能做桌面软件

> **这篇指南是干什么的**：教你——或者你指定的任何一个 AI——把这个壳子变成一个真正的桌面软件。
> 全程不需要你学会编程。你需要的是**把想法说清楚**，以及**会把第三章的提示词补全**。
>
> **三种读法**：
> - 完全不懂技术 → 从第一章顺着读到第三章，然后填空、发给 AI，当天就能看到软件跑起来；
> - 懂一点技术 → 直接看第三章（提示词模板）和第七章（给 AI 的说明书）；
> - 你是来改这个仓库的 AI → 直接读第七章，人类章节不用看。

---

## 一、原理：为什么"不懂技术"现在也能做软件

### 1.1 过去 vs 现在

| | 过去 | 现在 |
|---|---|---|
| 做一个桌面软件 | 学几年编程，或花钱请团队 | 你描述需求，AI 写代码，壳子提供地基 |
| 卡住的地方 | 每一行都不会写 | 需求说不清；环境没装好（一次性的事） |
| 你的核心工作 | 写代码 | **说清楚要什么 + 判断 AI 做得对不对** |

做软件拆开看是三件事：**地基**（窗口、托盘、安装包、自动更新）、**功能**（你的业务逻辑）、
**界面**（用户看到的样子）。编程难，难在地基和把功能翻译成代码——而这两件现在分别由
**壳子**和 **AI** 承担。你负责第三件事：**决定这个软件是什么**。

### 1.2 三方分工

| 角色 | 负责什么 | 你（或你的 AI）要做的 |
|---|---|---|
| **你** | 需求与判断 | 用大白话说清"谁用、做什么、长什么样"；验收 AI 的成果 |
| **AI** | 写代码、改代码、跑命令、排错 | 按第七章的说明书和仓库里的 `CLAUDE.md` 纪律干活 |
| **Deskbase 壳子** | 软件的地基与骨架 | 什么都不用做——它已经在那里了 |

### 1.3 壳子已经铺好的三层地基（人话版）

| 层 | 听起来很技术 | 翻译成人话 |
|---|---|---|
| 🎨 UI 风格 | 设计 token + 30+ 组件 + 动效体系 | 按钮/开关/弹窗/深浅主题全都做好且风格统一，AI 直接拿来拼页面，不像野生代码那样"能跑但难看" |
| ⚙️ 技术架构 | 托盘 + 单实例 + 窗口生命周期 + 配置持久化 | 关闭窗口不退到托盘、双击不开第二个窗口、设置项自动记住——这些"桌面软件该有的规矩"都已实现 |
| 🔄 更新架构 | 签名自动更新 + 一键发版链 | 你发一版，所有用户的软件自动升级。这一层是大部分模板缺失、而真实软件最耗时的部分 |

**边界说清楚**：壳子不含任何业务代码——"你的软件到底做什么"那一行都没有，等你来填。
壳子只保证你把精力花在自己的想法上，不花在重复造轮子上。

---

## 二、开始之前：一次性准备（约 30 分钟，只需做一次）

### 2.1 安装三件套

桌面对环境要求比网页高一点，但只需一次。不会装就把这节整段丢给你的 AI，让它一步步带你装。

| 必装 | 版本 | Windows | macOS |
|---|---|---|---|
| Node.js | 22+ | nodejs.org 下载 LTS 安装包，一路下一步 | 同左，或 `brew install node` |
| Rust | stable | rustup.rs 下载 `rustup-init.exe`，一路默认 | 终端跑 `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| 系统依赖 | — | WebView2 运行时（Win10/11 一般自带）+ VS C++ Build Tools（见 tauri.app/start/prerequisites） | Xcode 命令行工具：终端跑 `xcode-select --install` |

装完开终端验证（Windows：`Win+X` 选"终端"；macOS：启动台搜"终端"）：

```bash
node -v    # 应显示 v22.x 或更高
cargo -v   # 应显示 cargo 1.xx
```

两个都出版本号，环境就绪。**这一步只此一次**，以后做多少软件都不用再装。

### 2.2 选一个能干活的 AI

两种都行，体验不同：

- **能直接操作你电脑的 AI**（推荐）：如 WorkBuddy、Claude Code、Cursor 这类工具。你把第三章的
  提示词发给它，它自己复制目录、跑命令、改代码、开软件给你看——你全程看着。
- **只能对话的 AI**（如各家的网页版）：让它把每一步命令和代码写给你，你复制到终端里执行。
  慢一些，但同样能走完全程。

### 2.3 把壳子拿到手

```bash
git clone https://github.com/lzlkyb/deskbase.git
cd deskbase
```

没有 git 就在 GitHub 页面点 `Code → Download ZIP`，解压到任意目录。

---

## 三、魔法提示词：你唯一需要学会的东西

### 3.1 理念

你不需要会说技术语言。你只需要把下面这段话**补全**，发给你的 AI。它读得懂仓库里的
`CLAUDE.md` 和第七章说明书，会自己完成剩下的一切。

### 3.2 提示词模板（整段复制，把 `< >` 换掉）

```text
我要基于 Deskbase（Tauri 2 桌面应用壳子）开发一个桌面软件，壳子仓库在 <壳子路径>。

请先完整阅读该仓库里的 CLAUDE.md 和 docs/AI上手指南.md 第七章，遵守其中的工程纪律，
然后按顺序完成，每完成一步向我汇报：

1. 环境检查：依次跑 node -v、cargo -v，缺什么告诉我怎么装；
2. 把壳子复制到 <你的目标路径>，并跑改名命令：
   node scripts/rename-app.mjs <英文短名> --repo <你的GitHub名/仓库名> --display "<中文软件名>"；
3. 先npm install装依赖；
4. 阅读 desktop/src/components/tabs/HomeTab.tsx，把它替换成我的业务页面。
   我的需求是：<见下方"需求描述">；
5. 改完后跑门禁：组件体量检查、eslint、tsc、vitest，必须全绿；
6. 最后 npm run tauri dev 把软件跑起来，告诉我窗口里能看到什么、怎么操作。

需求描述：
<用大白话写：这个软件给谁用？解决什么问题？界面上有哪些东西？
 数据存在哪（本机就行/要联网）？有没有定时、通知这类特殊行为？
 越具体，AI 一次做对的概率越高。>

```

### 3.3 怎么写好"需求描述"

同一个"待办清单软件"，三种写法的效果对比：

| 写法 | 需求描述 | 结果 |
|---|---|---|
| ❌ 太模糊 | "我要一个待办软件" | AI 只能猜，大概率返工三五轮 |
| ⚠️ 及格 | "能添加待办、打勾完成、删除" | 能做出来，但细节（存不存在？关掉再开还在吗？）每次都要补 |
| ✅ 好 | "给个人用的待办清单：左边输入框+添加按钮，右边列表；每条有关键字、完成时间；能勾选完成（完成的排到底部）、能删除；数据存本机，关掉重开不丢；界面用壳子自带的组件，深浅主题都要好看" | 大概率一次到位 |

**口诀**：谁用 · 做什么 · 界面上有什么 · 数据存哪 · 有什么特殊行为（定时/通知/联网）。

### 3.4 AI 干活时你在旁边看什么

不需要看懂代码，看三件事就够：

1. **它有没有先出方案再动手**（仓库规则要求先方案后代码，没有就提醒它）；
2. **它有没有跑门禁**（第七章的清单，全绿才算完）；
3. **软件跑起来后，界面上你描述的东西是不是都在、点起来符合预期**。

不满意就直接说"这里不对，应该是……"，把 AI 当乙方使，不用客气。

---

## 四、三个实战示例

三个示例都是"填空式"：把尖括号内容换成你的，整段发给 AI。

### 4.1 示例一：待办清单（最简，建立信心用）

```text
按 CLAUDE.md 和 docs/AI上手指南.md 的规范，把壳子改成待办清单软件：
复制到 <路径>，改名 todo --repo <你的GitHub名/todo> --display "待办清单"。
业务需求：输入框 + 添加按钮建待办；列表每条可勾选完成（完成的沉底+划线）、
可删除；数据存本机 JSON，重启不丢；界面只用壳子已有组件，别引新依赖。
```

**你会看到**：左侧导航"首页"点进去是待办页；添加/勾选/删除都即时生效；关掉重开数据还在。

### 4.2 示例二：本地笔记工具（数据持久化 + 稍复杂界面）

```text
按规范把壳子改成本地笔记工具，复制到 <路径>，改名 notes
--repo <你的GitHub名/notes> --display "我的笔记"。
业务需求：左侧笔记列表（标题+修改时间，新的在上），右侧编辑器（多行文本）；
支持新建、重命名、删除；输入自动保存到本机，重启不丢；空状态要有引导文字。
搜索框可按标题过滤。
```

**AI 会怎么做**（顺便看懂它的思路）：新建 Rust 命令读写 JSON 配置文件（壳子已有
`get_config`/`save_config` 范式可抄），前端用壳子的 Card/Button/EmptyState 拼两栏布局。
你要做的只是验收。

### 4.3 示例三：每日工作提醒（后台定时 + 系统通知）

```text
按规范把壳子改成"每日提醒"软件，复制到 <路径>，改名 daily-remind
--repo <你的GitHub名/daily-remind> --display "每日提醒"。
业务需求：用户可添加多条提醒（时间 + 内容）；到点弹系统通知（壳子已集成通知插件）；
时间到了即使窗口关着（托盘常驻）也要能触发；数据存本机重启不丢。
```

**这一示例的重点**：涉及"后台常驻 + 定时"，正是野生代码最容易翻车的地方（内存泄漏、
关窗后不触发）。壳子里已有托盘常驻、窗口隐藏停轮询、通知发送的成熟实现，AI 按第七章
 SOP 接线即可——这就是壳子的价值。

---

## 五、从"能跑"到"能发布"：自动更新是壳子最强的一块

软件做好只是上半场。让**别人用上、并且永远用最新版**，才是桌面软件的完整生命周期。

### 5.1 三个阶段

| 阶段 | 命令 | 得到什么 |
|---|---|---|
| ① 自己用 | `npm run tauri dev` | 开发模式，改代码即时热更新 |
| ② 发给朋友 | `npm run build`（先问过你再构建，见 CLAUDE.md 第 3 条） | 一个 `.exe` + 安装包，双击即装 |
| ③ 全网分发 + 自动更新 | 推到 GitHub 后 `npm run release -- --patch` | CI 自动构建 Windows/macOS 双平台安装包并附到 Release；老用户下次启动**自动收到更新** |

第 ③ 阶段的整条链（版本号管理 → tag → 双平台构建 → 更新清单合并 → 发布）壳子已全部自动化，
你只需要说一声"发个 patch 版"，AI 会跑 `npm run release`，中间不用你管。

### 5.2 唯一需要小心的地方：签名密钥

自动更新靠"数字签名"保证安全：只有你能签发出的安装包，用户软件才肯自动升级
（否则随便一台服务器就能给你的用户投毒）。所以正式发布前，必须把壳子自带的**测试密钥**
换成你自己的：

```bash
npx tauri signer generate -w ~/.tauri/my-tool.key
```

- **公钥** → 填进 `desktop/src-tauri/tauri.conf.json` 的 `plugins.updater.pubkey`（告诉用户"认这个签名"）；
- **私钥** → 填进 GitHub 仓库 `Settings → Secrets → TAURI_SIGNING_PRIVATE_KEY`（只有你能签，GitHub 帮你签）。

这两步 AI 都会带你做。**只用本地开发/测试的话不用管密钥**——本地跑起来与跑测试都不依赖签名（检查不到更新
只是徽章提示）。另外注意：本地联调专用开关 `dangerousInsecureTransportProtocol`
在正式发布前要删掉（AI 发版时会处理）。

### 5.3 想先练手"发版但不公开"（进阶）

壳子自带假更新服务器，可以在本机把"检查→下载→安装"整条链走一遍，不推 GitHub：

```bash
# 终端 1：起假更新服务器
node desktop/scripts/fake-update-server.mjs --dir desktop/src-tauri/target/release/bundle/nsis
# 终端 2：dev 应用的更新端点指到它
APP_UPDATE_ENDPOINT=http://127.0.0.1:8787/updater.json npm run tauri dev
```

---

## 六、排错：把错误整段贴给 AI

### 6.1 症状对照表

| 症状 | 大概率原因 | 怎么办 |
|---|---|---|
| `npm install` 报 peer 依赖错误 | npm 10.9.x 与 vitest 4 的已知兼容问题 | 跑一次 `npm install --legacy-peer-deps` 生成 lockfile 后恢复正常 |
| `npm run tauri dev` 秒退 | 装过的旧版本（同一个 identifier）正在运行，持有了单实例锁 | 任务管理器结束旧进程；或先卸载旧版 |
| Rust 编译一大串红 | 99% 是环境问题（VS Build Tools 组件不全 / Rust 版本旧） | 把完整报错贴给 AI，它会定位到缺哪个组件 |
| 门禁报"组件超 300 行" | 体量红线（壳子的硬规矩） | 让 AI 拆文件——这是特性不是 bug，它在保护你的软件不烂成一团 |
| 界面"能跑但难看" | AI 没用壳子的组件 | 提醒它：只许用 `src/components/ui/` 里的组件和 index.css 的 token，不许自创样式 |
| 安装包体积暴涨 | 引了重依赖 | 壳子红线 ≤15MB，让 AI 找轻量替代或砍掉 |

### 6.2 通用方法论

1. **报错整段贴**：不要自己转述"它说有个错"，把终端里从命令到报错的完整几行原样贴给 AI；
2. **一次只改一个地方**：AI 同时改五处然后炸了，谁也看不出是谁炸的；
3. **门禁必须全绿才算完**：`docs/AI上手指南.md` 第七章的清单就是验收标准，差一项都让 AI 继续。

---

## 七、给 AI 的完整说明书（机器可读）

> 人类读者到这里可以停了。以下是给"接下来要操作这个仓库的 AI"的规范摘要，
> 完整版以仓库根目录 `CLAUDE.md` 为准；两者冲突时以 `CLAUDE.md` 为准。

### 7.1 定位

本仓库**不是应用，是壳子**：Tauri 2 + React 18 + TypeScript + Rust 的桌面应用脚手架。
任何具体应用都从这里**复制一份**再改，壳子本体只接受通用架构改进的回流，不加业务代码。

### 7.2 复制即运行的事实（回答"是否需要额外配置"）

- **本地开发零额外配置**：`npm install && npm run tauri dev` 直接跑。`tauri.conf.json`
  内置 `dangerousInsecureTransportProtocol: true` 本地联调开关；updater 端点指向尚未
  发布的 Pages 地址，自动检查失败只是徽章提示，不阻断使用。里面的公钥是 deskbase 自己的
  发布公钥——本地开发与测试都不依赖它。
- **测试零额外配置**：`cargo test --no-default-features` 用假签名跑通
  `tests/update_flow.rs` 的"检查→下载→验签失败"全链路（测试断言的就是验签失败，
  与公钥具体值无关，换任何密钥对都不红）。
- **改名是复制品的第一步**，不是可选项：

  ```bash
  node scripts/rename-app.mjs <slug> --repo <owner/repo> --display "<中文显示名>"
  ```

  十七处产品标识一次改齐（Cargo 包名/exe 名、Rust crate 名、tauri.conf、branding.rs、
  about.ts、HTML 标题、CI 产物名）。**漏改的典型症状**：托盘 tooltip 还叫 Deskbase、
  CI 找不到 exe、Rust 编译 E0432。注意：改名只在复制品上执行，壳子自身已叫 deskbase。
- **正式发布前**（不是现在）才需要：自己的签名密钥对（`npx tauri signer generate`）、
  删 `dangerousInsecureTransportProtocol`、配 GitHub secret。

### 7.3 目录地图

```text
deskbase/
├── CLAUDE.md                    # 工程纪律全文（动手前必读）
├── docs/AI上手指南.md            # 本文件
├── .github/workflows/build.yml  # CI：前端门禁 + Rust 测试 + tag 双平台发版
└── desktop/
    ├── src/
    │   ├── index.css            # 设计 token（浅/深 × classic/glass），改 UI 先读它
    │   ├── App.tsx              # 骨架：renderTab 页面表 + Ctrl+1~N 快捷键
    │   ├── components/
    │   │   ├── ui/              # 30+ 基础组件，新页面只许从这里取件
    │   │   ├── layout/          # Header + SideNav（WORKSPACE_NAV 是导航单一来源）
    │   │   ├── update/          # 更新 UI 全家桶
    │   │   └── tabs/            # 业务页面放这里（HomeTab.tsx 是范式样板）
    │   ├── contexts/UpdateContext.tsx  # 更新状态机 idle→…→ready→重启
    │   ├── lib/about.ts         # APP_INFO：显示名/标语/仓库地址（与 branding.rs 双维护）
    │   └── lib/                 # 主题/动效/平台/配置等纯函数
    ├── scripts/                 # rename-app / release / generate-updater-json / fake-update-server 等
    └── src-tauri/
        ├── src/main.rs          # 托盘/单实例/窗口生命周期/DWM 圆角
        ├── src/commands/        # system.rs + update.rs（新增命令：写函数→pub mod→pub use→invoke_handler 注册，四处）
        ├── src/security/path.rs # 路径白名单，任何改动不得削弱
        └── tauri.conf.json      # 产品标识/updater 端点/NSIS 配置
```

### 7.4 标准任务 SOP

**加一个业务页面**（最常见任务，三处接线）：

1. `src/components/tabs/XxxTab.tsx` 新文件，照 `HomeTab.tsx` 的范式写（invokeOrToast 读配置、
   ui/ 组件搭界面、useUpdate 接更新）；
2. `src/components/layout/SideNav.tsx` 的 `WORKSPACE_NAV` 加一项（导航单一来源，快捷键自动跟随）；
3. `src/App.tsx` 的 `renderTab` 加一个 case。超首屏的页面用 `lazy()` 懒加载，照 SettingsTab。

**加一个 Rust 命令**：`commands/` 下写函数 → `commands/mod.rs` 的 `pub mod` + `pub use` →
`main.rs` 的 `invoke_handler` 注册。四处都有注释标出。

**改界面**：先读真实组件源码与 index.css token，再出 HTML 设计稿放 `design/` 给用户确认，
然后才落代码。不许凭空自创样式、不许绕开 ui/ 组件。

### 7.5 纪律清单（违反任何一条都算没完成）

| # | 纪律 | 机器执行者 |
|---|---|---|
| 1 | 单文件 ≤300 行且 `useState`+`useEffect` ≤8，棘轮基线 | `scripts/check-component-size.mjs` |
| 2 | `cargo fmt --check` 零差异 | 格式门禁 |
| 3 | eslint 零豁免（react-hooks 两条规则是重点） | `eslint .` |
| 4 | `tsc --noEmit` 零错误 | 类型门禁 |
| 5 | `vitest` 全绿 | `npm test` |
| 6 | `cargo clippy --all-targets --no-default-features -- -D warnings` 零警告 | clippy |
| 7 | `cargo test --no-default-features` 全绿 | 测试门禁 |
| — | 版本号唯一真源是 `src-tauri/Cargo.toml`，另两处由 sync-version.mjs 自动同步，禁止手改 | sync-version |
| — | 换行 LF；提交信息用 `feat:/chg:/fix:/refactor:/docs:` 前缀；**等用户说"提交"才 commit** | 人工 |

### 7.6 验收标准

1. 七项门禁全绿（`desktop/` 下按 7.5 清单逐项跑，或启用 `.githooks/pre-push` 一把跑）；
2. `npm run tauri dev` 能起来，窗口/托盘/设置页/更新徽章都正常；
3. 用户描述的业务路径完整走一遍（增删改查每个都点一次）；
4. 有后台循环/定时任务时，逐条过 `CLAUDE.md` §8.1 的六项检查（让出点/生产端异常/流结束信号/单轮成本/兜底上限/平台分支验证）。

---

## 附：一页速查

```bash
# 复制 → 改名 → 跑起来（三步，其余都交给 AI）
cp -r deskbase my-app && cd my-app/desktop
node scripts/rename-app.mjs my-tool --repo your-name/my-tool --display "我的工具"
npm install && npm run tauri dev

# 门禁（改完必跑）
node scripts/check-component-size.mjs && npx eslint . && npx tsc --noEmit && npx vitest run
cd src-tauri && cargo clippy --all-targets --no-default-features -- -D warnings && cargo test --no-default-features

# 发版（先 commit 功能代码，再说"tag"）
cd desktop && npm run release -- --patch
```
