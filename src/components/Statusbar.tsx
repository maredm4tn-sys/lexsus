import { useState } from "react";
import {
  FolderIcon,
  RadioIcon,
  SquareTerminalIcon,
} from "lucide-react";
import type {
  FailoverStatus,
  McpStatus,
  TerminalRunEvent,
} from "../lib/types";
import { useTauriEvent } from "../hooks/useTauriEvent";
import { cn } from "../lib/utils";
import { useTranslation } from "../lib/i18n";

function stateColor(state: string): string {
  switch (state) {
    case "working":
      return "text-success";
    case "stalled":
      return "text-warning";
    case "interrupted":
      return "text-danger";
    default:
      return "text-muted-foreground";
  }
}

interface StatusbarProps {
  projectRoot: string;
  connector: McpStatus | null;
  /** Failover state, owned by `useFailover` and shared with FailoverBanner. */
  status: FailoverStatus | null;
}

export default function Statusbar({
  projectRoot,
  connector,
  status,
}: StatusbarProps) {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);

  useTauriEvent<TerminalRunEvent>("terminal://run", (payload) => {
    if (payload.kind === "start") setRunning(true);
    else if (payload.kind === "exit") setRunning(false);
  });

  const local = status?.local ?? "inactive";
  const web = status?.web ?? "inactive";

  return (
    <footer className="glass-sidebar flex h-7 shrink-0 items-center gap-4 border-t px-3 text-[11px] text-muted-foreground">
      <span className="flex min-w-0 items-center gap-1.5">
        <FolderIcon className="size-3 shrink-0" />
        <span className="truncate font-mono" title={projectRoot}>
          {projectRoot ? projectRoot.split(/[\\/]/).pop() : t("statusbar.no_project")}
        </span>
      </span>

      <span className="flex items-center gap-1">
        {t("statusbar.local")}
        <span className={cn("font-medium", stateColor(local))}>{local}</span>
      </span>
      <span className="flex items-center gap-1">
        {t("statusbar.web")}
        <span className={cn("font-medium", stateColor(web))}>{web}</span>
      </span>

      <span className="ms-auto flex items-center gap-1.5">
        <span
          className={cn(
            "size-1.5 rounded-full",
            connector?.listening ? "bg-success" : "bg-muted-foreground/40",
          )}
        />
        {connector?.listening
          ? connector.allow_write
            ? t("statusbar.connector_rw")
            : t("statusbar.connector_ro")
          : t("statusbar.connector_offline")}
      </span>
      <span className="flex items-center gap-1.5">
        <SquareTerminalIcon className="size-3" />
        <span className={cn(running && "text-success")}>
          {running ? t("statusbar.running") : t("statusbar.idle")}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <RadioIcon className="size-3" />
        {t("statusbar.bridge_online")}
      </span>
    </footer>
  );
}
