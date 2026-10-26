import { useEffect, useState } from "react";
import { invoke } from "../../lib/tauri";
import { APP_INFO, CHANGELOG, CATEGORY_LABELS } from "../../lib/about";
import { Card } from "../ui/card";
import { Modal } from "../ui/Modal";
import { ToggleRow } from "../ui/ToggleRow";
import { SettingsRow } from "../ui/SettingsRow";
import { Button } from "../ui/button";

/**
 * 示例设置页（壳子版）。演示「读配置 → 表单 → 写配置」闭环，
 * 业务把行项换成自家设置即可。
 *
 * 体量红线同样适用：超 300 行 / 8 个 state 前拆件。
 */
export function SettingsTab({ onChanged }: { onChanged?: () => void }) {
  const [autostart, setAutostart] = useState(false);
  const [releaseOnClose, setReleaseOnClose] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  // 挂载拉一次真实配置（get_config 命令，见 commands/system.rs）
  useEffect(() => {
    void (async () => {
      try {
        const cfg = await invoke<{ autostartEnabled: boolean; releaseWebviewOnClose: boolean }>(
          "get_config",
        );
        setAutostart(cfg.autostartEnabled);
        setReleaseOnClose(cfg.releaseWebviewOnClose);
      } catch {
        // 读失败保持默认值即可，不阻断页面
      }
    })();
  }, []);

  const save = async (patch: Record<string, unknown>) => {
    try {
      const cfg = await invoke<{ autostartEnabled: boolean; releaseWebviewOnClose: boolean }>(
        "get_config",
      );
      await invoke("save_config", { config: { ...cfg, ...patch } });
      onChanged?.();
    } catch {
      // invokeOrToast 已提示；这里保持静默避免双 toast
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-lg font-medium">设置</h1>

      <Card className="flex flex-col gap-1 p-2">
        <ToggleRow
          label="开机自启"
          sub="登录系统时自动启动（托盘常驻）"
          checked={autostart}
          onChange={async (v) => {
            setAutostart(v);
            await invoke("set_autostart", { enabled: v });
            await save({ autostartEnabled: v });
          }}
        />
        <ToggleRow
          label="关窗时释放界面内存"
          sub="关闭窗口时销毁 WebView，省约 80MB 内存"
          checked={releaseOnClose}
          onChange={(v) => {
            setReleaseOnClose(v);
            void save({ releaseWebviewOnClose: v });
          }}
        />
      </Card>

      <Card className="flex flex-col gap-1 p-2">
        <SettingsRow
          label="关于"
          sub={`${APP_INFO.name} · ${APP_INFO.license}`}
          control={
            <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
              查看更新历史（{CHANGELOG.length} 版）
            </Button>
          }
        />
        <SettingsRow
          label="版本"
          sub={latestDate()}
          control={<span className="text-sm tabular-nums text-muted-foreground">v{CHANGELOG[0]?.version ?? "0.0.0"}</span>}
        />
        <SettingsRow
          label="仓库"
          sub={APP_INFO.repoUrl}
          control={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void invoke("open_external", { url: APP_INFO.repoUrl })}
            >
              打开
            </Button>
          }
        />
      </Card>

      <p className="px-1 text-xs text-muted-foreground">
        分类图例：{Object.values(CATEGORY_LABELS).join(" / ")}
      </p>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} ariaLabel="更新历史" className="modal-surface">
        <div className="flex max-h-[60vh] w-[min(560px,90vw)] flex-col gap-3 overflow-y-auto p-5">
          <h2 className="text-base font-medium">更新历史</h2>
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium tabular-nums">v{entry.version}</span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="flex flex-col gap-0.5 pl-4">
                {entry.items.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    [{CATEGORY_LABELS[item.category]}] {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {CHANGELOG.length === 0 && <p className="text-sm text-muted-foreground">暂无版本记录。</p>}
        </div>
      </Modal>
    </div>
  );
}

function latestDate(): string {
  return CHANGELOG[0] ? `最近更新：${CHANGELOG[0].date}` : "";
}
