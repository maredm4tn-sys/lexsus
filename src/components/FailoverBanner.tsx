import {
  AlertTriangleIcon,
  GlobeIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";
import type {
  FailoverLocalEvent,
  FailoverStatus,
  FailoverWebEvent,
} from "../lib/types";
import { Button } from "./ui/button";
import { useTranslation } from "../lib/i18n";

function fmtIdle(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

interface FailoverBannerProps {
  status: FailoverStatus | null;
  localEvent: FailoverLocalEvent | null;
  webEvent: FailoverWebEvent | null;
  dismiss: (agent: "local" | "web") => void;
}

export default function FailoverBanner({
  status,
  localEvent,
  webEvent,
  dismiss,
}: FailoverBannerProps) {
  const { t } = useTranslation();
  const local = status?.local ?? "inactive";

  const localStalled = local === "stalled" && !localEvent;
  const localError = localEvent && !localEvent.ok;
  const localDelivered = !!localEvent?.ok;

  if (!localStalled && !localError && !localDelivered && !webEvent) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-col gap-0.5 border-b border-border/60 bg-surface-2/60 px-4 py-2 text-xs anim-fade-down text-start">
      {localStalled && (
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 shrink-0 text-warning" />
          <p className="min-w-0 flex-1 text-muted-foreground">
            {t("failover.local_idle")}
          </p>
          <Button variant="ghost" size="sm" onClick={() => dismiss("local")}>
            {t("failover.keep_working")}
          </Button>
        </div>
      )}

      {localError && (
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="size-4 shrink-0 text-danger" />
          <p className="min-w-0 flex-1 font-medium text-danger">
            {t("failover.interrupted_handoff")}
            {localEvent.error && (
              <span className="ms-2 font-normal text-muted-foreground">
                {localEvent.error}
              </span>
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={() => dismiss("local")}>
            {t("failover.dismiss")}
          </Button>
        </div>
      )}

      {localDelivered && (
        <div className="flex items-center gap-2">
          {localEvent.delivered ? (
            <SparklesIcon className="size-4 shrink-0 text-success" />
          ) : (
            <ShieldAlertIcon className="size-4 shrink-0 text-warning" />
          )}
          <p className="min-w-0 flex-1 font-medium">
            {localEvent.delivered
              ? t("failover.interrupted_auto")
              : t("failover.interrupted_handoff")}
            {localEvent.idle_ms != null && (
              <span className="ms-2 font-normal text-muted-foreground">
                {t("failover.after_idle", { time: fmtIdle(localEvent.idle_ms) })}
              </span>
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={() => dismiss("local")}>
            {t("failover.dismiss")}
          </Button>
        </div>
      )}

      {webEvent && (
        <div className="flex flex-col gap-2 py-1">
          <div className="flex items-center gap-2">
            <GlobeIcon className="size-4 shrink-0 text-warning" />
            <p className="min-w-0 flex-1 font-medium">
              {t("failover.web_session_lost", {
                reason: webEvent.trigger === "ws_drop" ? "disconnected" : "went idle",
              })}
              <span className="ms-2 font-normal text-muted-foreground">
                {t("failover.after_idle", { time: fmtIdle(webEvent.idle_ms) })}
              </span>
            </p>
            <span className="hidden text-muted-foreground md:inline">
              {t("failover.pickup_handoff")}
            </span>
            <Button variant="ghost" size="sm" onClick={() => dismiss("web")}>
              {t("failover.dismiss")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
