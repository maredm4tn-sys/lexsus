import { useEffect, useRef, useState } from "react";
import {
  BrainIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CompassIcon,
  FilePenIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";
import {
  factsExtract,
  sessionEventsGet,
  sessionsList,
} from "../lib/bridge";
import type {
  ArchiveReport,
  ProjectFacts,
  SessionEvent,
  SessionSummary,
} from "../lib/types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "../components/ui/toast";
import { useTranslation } from "../lib/i18n";
import { ViewShell } from "./ViewShell";

function FactList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "decision" | "failure" | "constraint";
}) {
  if (items.length === 0) return null;
  const color =
    tone === "failure"
      ? "text-danger"
      : tone === "constraint"
        ? "text-warning"
        : "text-info";
  return (
    <div className="flex flex-col gap-1 text-start">
      <p className={`text-[11px] font-medium ${color}`}>{title}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-xs leading-relaxed text-muted-foreground"
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MemoryView() {
  const { t, dir } = useTranslation();
  const [facts, setFacts] = useState<ProjectFacts | null>(null);
  const [report, setReport] = useState<ArchiveReport | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [openEvents, setOpenEvents] = useState<SessionEvent[] | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const requestedRef = useRef<number | null>(null);

  async function scan() {
    setBusy(true);
    try {
      const snap = await factsExtract();
      setFacts(snap.facts);
      setReport(snap.report);
      setSessions(await sessionsList(10));
      toast.add({
        title: t("common.success"),
        description: `${snap.report.refreshed} / ${snap.report.skipped}`,
        type: "success",
      });
    } catch (e) {
      toast.add({ title: t("common.error"), description: String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function toggleSession(id: number) {
    if (requestedRef.current === id) {
      requestedRef.current = null;
      setOpenId(null);
      setOpenEvents(null);
      return;
    }
    requestedRef.current = id;
    setOpenId(id);
    setOpenEvents(null);
    try {
      const events = await sessionEventsGet(id, 30);
      if (requestedRef.current === id) setOpenEvents(events);
    } catch (e) {
      if (requestedRef.current === id) {
        toast.add({ title: t("common.error"), description: String(e) });
      }
    }
  }

  useEffect(() => {
    void sessionsList(10)
      .then(setSessions)
      .catch(() => {});
  }, []);

  function fmtTs(ms: number): string {
    if (!ms) return "";
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <ViewShell
      icon={BrainIcon}
      title={t("views.memory.title")}
      description={t("views.memory.description")}
      actions={
        <>
          <Button size="sm" disabled={busy} onClick={() => void scan()}>
            <SparklesIcon /> {t("views.memory.scan_button")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() =>
              void sessionsList(10)
                .then(setSessions)
                .catch(() => {})
            }
          >
            <RefreshCwIcon /> {dir === "rtl" ? "تحديث" : "Refresh"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-start">
        {report && (
          <p className="text-right text-[11px] text-muted-foreground">
            {report.refreshed} new · {report.skipped} unchanged
          </p>
        )}

        {facts ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2.5">
            {facts.objective && (
              <div className="flex items-start gap-2">
                <CompassIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                <p className="text-xs leading-relaxed">{facts.objective}</p>
              </div>
            )}
            <FactList
              title={t("views.memory.decisions")}
              items={facts.decisions.slice(0, 4)}
              tone="decision"
            />
            <FactList
              title={t("views.memory.failures")}
              items={facts.failed_attempts.slice(0, 4)}
              tone="failure"
            />
            <FactList
              title={t("views.memory.constraints")}
              items={facts.constraints.slice(0, 4)}
              tone="constraint"
            />
            {facts.changed_files.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <FilePenIcon className="size-3.5 shrink-0 text-muted-foreground" />
                {facts.changed_files.slice(0, 8).map((f) => (
                  <code
                    key={f}
                    className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]"
                  >
                    {f.split(/[\\/]/).pop()}
                  </code>
                ))}
                {facts.changed_files.length > 8 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{facts.changed_files.length - 8}
                  </span>
                )}
              </div>
            )}
            {facts.progress_percent > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {t("views.handoff.progress")}: {facts.progress_percent}%
              </p>
            )}
            {facts.decisions.length +
              facts.failed_attempts.length +
              facts.constraints.length ===
              0 &&
              !facts.objective && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CircleAlertIcon className="size-3.5" /> {t("views.memory.no_memory_yet")}
                </p>
              )}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {t("views.memory.no_memory_yet")}
          </p>
        )}

        {sessions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="app-eyebrow text-muted-foreground">
              {t("views.memory.sessions")}
            </p>
            {sessions.map((s) => (
              <div key={s.id}>
                <button
                  type="button"
                  onClick={() => void toggleSession(s.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-muted/40"
                >
                  <ChevronRightIcon
                    className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${openId === s.id ? "rotate-90" : dir === "rtl" ? "rotate-180" : ""}`}
                  />
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    #{s.id}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {s.objective ?? s.source?.split(/[\\/]/).pop() ?? `session ${s.id}`}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {s.events} events · {s.started_at.slice(11, 16)}
                  </span>
                </button>
                {openId === s.id && openEvents && (
                  <div className="ms-6 mt-1 max-h-44 overflow-y-auto rounded-md border border-border/60 bg-surface-2/50 p-2">
                    {openEvents.map((e, i) => (
                      <p
                        key={`${e.ts_ms}-${i}`}
                        className="truncate text-[11px] leading-relaxed text-muted-foreground"
                        title={e.payload}
                      >
                        <span className="font-mono opacity-70">
                          {fmtTs(e.ts_ms)}
                        </span>{" "}
                        <span
                          className={
                            e.kind === "error" ? "text-danger" : "opacity-90"
                          }
                        >
                          [{e.kind}]
                        </span>{" "}
                        {e.payload}
                      </p>
                    ))}
                    {openEvents.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        no events recorded
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ViewShell>
  );
}
