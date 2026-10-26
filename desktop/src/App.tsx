import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "./lib/tauri";
import { CHANGELOG } from "./lib/about";
import {
  getLastSeenVersion,
  setLastSeenVersion,
  countUnreadVersions,
} from "./lib/utils";
import { transitionPage } from "./lib/pageTransition";
import { Header } from "./components/layout/Header";
import { SideNav, WORKSPACE_NAV } from "./components/layout/SideNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppHiddenFlag } from "./hooks/useAppHiddenFlag";
import { useWindowSizePersistence } from "./hooks/useWindowSizePersistence";
import { useAppHidden } from "./lib/appVisibility";
import { Skeleton } from "./components/ui/Skeleton";
import { HomeTab } from "./components/tabs/HomeTab";

// 非首屏 Tab 懒加载：减小首屏 JS，切到对应 Tab 时才加载（fallback 用骨架屏）。
// 业务页照此模式追加：lazy(() => import("./components/tabs/XxxTab").then(m => ({ default: m.XxxTab })))
const SettingsTab = lazy(() =>
  import("./components/tabs/SettingsTab").then((m) => ({ default: m.SettingsTab })),
);

/**
 * 应用外壳（壳子版）。
 *
 * 保留的范式（业务直接沿用）：
 * - QueryClient 全局配置在 main.tsx（staleTime/retry/refetchOnWindowFocus）
 * - 窗口隐藏时停轮询：useAppHidden + refetchInterval（统一节流口径）
 * - 侧栏折叠 + 宽度记忆、Ctrl+1~N 快捷键来自 WORKSPACE_NAV 单一来源
 * - 页面切换过渡动画 transitionPage（pageTransition.ts）
 * - 错误边界 + 骨架屏 + Toast 三态
 *
 * 业务替换点：WORKSPACE_NAV（导航）、renderTab（页面表）、statusQuery（状态源）。
 */
function AppContent() {
  // 窗口收进托盘/最小化时给 <html> 打 data-app-hidden，暂停全部 CSS 动画。
  // WebView2 不会自己为隐藏窗口节流动画，实测不做这事会白烧约 0.6 个 CPU 核。
  useAppHiddenFlag();
  // 窗口尺寸持久化：启动恢复上次尺寸 + resize 防抖落盘（纯前端方案）
  useWindowSizePersistence();
  // 窗口不可见时停掉全部定时轮询（壳子示例 5s；业务按需调）
  const appHidden = useAppHidden();

  const [activeTab, setActiveTab] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  // ── 状态源（壳子示例：后端还没有业务状态，这里演示查询范式）──
  // 业务把 queryKey/queryFn 换成自家命令，如 invoke<StatusResponse>("get_status")
  const { data: status } = useQuery({
    queryKey: ["app-status"],
    queryFn: () => invoke<{ version?: string; running?: boolean }>("get_app_info"),
    refetchInterval: appHidden ? false : 5000,
    retry: false,
  });

  const queryClient = useQueryClient();
  const refreshStatus = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["app-status"] }),
    [queryClient],
  );

  // ── 更新未读计数（CHANGELOG 看了几版）──
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const versions = CHANGELOG.map((c) => c.version);
    const lastSeen = getLastSeenVersion();
    setUnreadCount(countUnreadVersions(versions, lastSeen));
    if (versions.length > 0 && versions[0] !== lastSeen) {
      // 首启/升级：把最新版标记为已读（红点只提示「有新版未看」，不反复）
      setLastSeenVersion(versions[0]);
    }
  }, []);

  // ── 页面切换过渡 ──
  const navigate = useCallback((tab: string) => {
    // View Transition 动画：update 回调里同步切 tab；当前页已是目标页时不动画
    transitionPage(() => setActiveTab(tab), activeTab !== tab);
  }, [activeTab]);

  // ── Ctrl+1~N 快捷键：顺序来自 WORKSPACE_NAV 单一来源 ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.altKey || e.metaKey) return;
      const idx = Number(e.key);
      if (Number.isInteger(idx) && idx >= 1 && idx <= WORKSPACE_NAV.length) {
        e.preventDefault();
        navigate(WORKSPACE_NAV[idx - 1].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const navItems = useMemo(() => WORKSPACE_NAV, []);

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <SideNav
        activeTab={activeTab}
        onNavigate={navigate}
        unreadCount={unreadCount}
        status={status}
        collapsed={collapsed}
        navItems={navItems}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onNavigate={navigate}
        />
        <main className="app-main page-transition flex min-h-0 flex-1 flex-col">
          <ErrorBoundary key={activeTab}>
            <Suspense fallback={<Skeleton className="m-4 h-40" />}>{renderTab(activeTab, refreshStatus)}</Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

/** 页面表：tab key → 组件。业务把这里换成自家页面。 */
function renderTab(tab: string, refreshStatus: () => void) {
  switch (tab) {
    case "home":
      return <HomeTab onChanged={refreshStatus} />;
    case "settings":
      return <SettingsTab onChanged={refreshStatus} />;
    default:
      return <HomeTab onChanged={refreshStatus} />;
  }
}

export default function App() {
  return <AppContent />;
}
