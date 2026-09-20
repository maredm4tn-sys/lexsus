import { useEffect, useState } from "react";
import {
  ProgressBar,
  ProgressBarFill,
  ProgressBarTrack,
  Spinner,
} from "@heroui/react";
import {
  ClipboardIcon,
  LightbulbIcon,
  MessageCircleIcon,
  RotateCcwIcon,
} from "lucide-react";
import { buildHandoff, setObjective } from "../lib/bridge";
import type { Handoff } from "../lib/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { toast } from "../components/ui/toast";
import { useTranslation } from "../lib/i18n";
import { ViewShell } from "./ViewShell";

export default function HandoffView() {
  const { t, dir } = useTranslation();
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [objective, setObj] = useState("");
  const [status, setStatus] = useState("");
  const [built, setBuilt] = useState(false);
  const [copied, setCopied] = useState(false);

  async function build() {
    const h = await buildHandoff();
    setHandoff(h);
    setObj(h.objective);
    setBuilt(true);
  }

  async function continueWith() {
    if (!handoff) return;
    await setObjective(objective).catch(() => {});
    const fresh = await buildHandoff();
    await navigator.clipboard.writeText(handoffText(fresh)).catch(() => {});
    setStatus(t("views.handoff.copied_status"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.add({
      title: t("common.copied"),
      description: t("views.handoff.copied_status"),
      type: "success",
    });
  }

  function handoffText(h: Handoff): string {
    const factBlock = [
      h.decisions?.length
        ? `Decisions made:\n${h.decisions.map((d) => `- ${d}`).join("\n")}`
        : "",
      h.failed_attempts?.length
        ? `Failed attempts (do not retry):\n${h.failed_attempts.map((a) => `- ${a}`).join("\n")}`
        : "",
      h.constraints?.length
        ? `Constraints:\n${h.constraints.map((c) => `- ${c}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    return [
      `# Continue this task (AI Continuity Bridge handoff)`,
      ``,
      `Objective: ${h.objective}`,
      `Progress: ${h.progress_percent}% · Files changed: ${h.files_changed} · Errors remaining: ${h.errors_remaining}`,
      `Next step: ${h.next_step ?? "review state"}`,
      h.files.length > 0 ? `Files involved: ${h.files.join(", ")}` : "",
      factBlock ? `\n${factBlock}\n` : "",
      ``,
      `You are now the coding agent for the local project on this machine.`,
      `You may request file reads, file writes, and command runs; the bridge executes them locally and returns real results.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  useEffect(() => {
    void build();
  }, []);

  return (
    <ViewShell
      icon={MessageCircleIcon}
      title={t("views.handoff.title")}
      description={t("views.handoff.description")}
      actions={
        handoff && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void navigator.clipboard
                .writeText(handoffText(handoff))
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                  toast.add({
                    title: t("common.copied"),
                    description: t("views.handoff.copied_status"),
                    type: "success",
                  });
                })
            }
          >
            {copied ? `${t("common.copied")} ✓` : <ClipboardIcon />}
            {copied ? "" : ` ${t("common.copy")}`}
          </Button>
        )
      }
    >
      {handoff ? (
        <div className="flex flex-col gap-4 text-start">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="objective">{t("views.handoff.objective_label")}</Label>
            <Input
              id="objective"
              value={objective}
              onChange={(e) => setObj(e.currentTarget.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("views.handoff.progress")}</span>
              <span className="font-mono">{handoff.progress_percent}%</span>
            </div>
            <ProgressBar
              value={handoff.progress_percent}
              color="accent"
              aria-label="Handoff progress"
            >
              <ProgressBarTrack className="h-1.5">
                <ProgressBarFill />
              </ProgressBarTrack>
            </ProgressBar>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
              <span className="text-[11px] text-muted-foreground">
                {t("views.handoff.files_changed")}
              </span>
              <span className="font-mono text-sm font-semibold">
                {handoff.files_changed}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
              <span className="text-[11px] text-muted-foreground">
                {t("views.handoff.errors_remaining")}
              </span>
              <span className="font-mono text-sm font-semibold">
                {handoff.errors_remaining}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
              <span className="text-[11px] text-muted-foreground">{dir === "rtl" ? "الحالة" : "State"}</span>
              <span className="font-mono text-sm font-semibold text-muted-foreground">
                {handoff.errors_remaining > 0 ? (dir === "rtl" ? "جارٍ العمل" : "in progress") : (dir === "rtl" ? "على المسار" : "on track")}
              </span>
            </div>
          </div>

          {handoff.next_step && (
            <p className="text-xs text-muted-foreground">
              {t("views.handoff.next_step")}: {handoff.next_step}
            </p>
          )}

          {handoff.end_reason && (
            <p className="text-[11px] text-muted-foreground">
              {handoff.end_reason}
            </p>
          )}

          {handoff.context && (
            <details className="rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
              <summary className="cursor-pointer text-[11px] text-muted-foreground">
                {dir === "rtl" ? "سياق المهمة (من سجل Claude Code)" : "task context (from your Claude Code transcript)"}
              </summary>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                {handoff.context}
              </p>
            </details>
          )}

          {((handoff.decisions?.length ?? 0) > 0 ||
            (handoff.failed_attempts?.length ?? 0) > 0 ||
            (handoff.constraints?.length ?? 0) > 0) && (
            <details className="rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
              <summary className="cursor-pointer text-[11px] text-muted-foreground">
                {dir === "rtl" ? `الحقائق المستخلصة (${handoff.decisions?.length ?? 0} قرارات، ${handoff.failed_attempts?.length ?? 0} محاولات فاشلة)` : `extracted facts (${handoff.decisions?.length ?? 0} decisions, ${handoff.failed_attempts?.length ?? 0} failed attempts)`}
              </summary>
              <div className="mt-1 flex flex-col gap-1.5">
                {handoff.decisions?.map((d) => (
                  <p key={d} className="text-xs leading-relaxed text-info">
                    • {d}
                  </p>
                ))}
                {handoff.failed_attempts?.map((a) => (
                  <p key={a} className="text-xs leading-relaxed text-danger">
                    ✗ {a}
                  </p>
                ))}
                {handoff.constraints?.map((c) => (
                  <p key={c} className="text-xs leading-relaxed text-warning">
                    ⚠ {c}
                  </p>
                ))}
              </div>
            </details>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void continueWith()}>
              <MessageCircleIcon /> {t("views.handoff.copy_button")}
            </Button>
            <Button variant="ghost" onClick={() => void build()}>
              <RotateCcwIcon /> {dir === "rtl" ? "إعادة بناء" : "Rebuild"}
            </Button>
          </div>

          {status && <p className="text-xs text-success">{status}</p>}

          {built && !handoff.files_changed && (
            <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              <LightbulbIcon className="mt-0.5 size-3.5 shrink-0" />
              {dir === "rtl" ? "قم بتشغيل جلسة Claude Code أولاً — البطاقة تُبنى مما تم إنجازه." : "Run a Claude Code session first — the card is built from what it did."}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Spinner size="sm" /> {t("common.loading")}
        </div>
      )}
    </ViewShell>
  );
}
