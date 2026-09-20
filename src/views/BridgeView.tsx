import { useEffect, useState } from "react";
import { ChevronDownIcon, GlobeIcon } from "lucide-react";
import {
  bridgeAudit,
  bridgeTool,
  mcpSetAllowWrite,
  mcpStatus,
} from "../lib/bridge";
import type {
  AuditEntry,
  BridgeTool,
  McpStatus,
  ToolResult,
} from "../lib/types";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import { useTranslation } from "../lib/i18n";
import { ViewShell } from "./ViewShell";

export default function BridgeView() {
  const { t } = useTranslation();
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [connector, setConnector] = useState<McpStatus | null>(null);
  const [readPath, setReadPath] = useState("src/App.tsx");
  const [writePath, setWritePath] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [command, setCommand] = useState("git status");
  const [sandbox, setSandbox] = useState<ToolResult | null>(null);

  useEffect(() => {
    void bridgeAudit(20)
      .then(setAudit)
      .catch(() => []);
    void mcpStatus()
      .then(setConnector)
      .catch(() => null);
  }, []);

  async function sandboxRun(tool: BridgeTool) {
    setSandbox(await bridgeTool(tool));
    setAudit(await bridgeAudit(20).catch(() => []));
  }

  const sectionClass =
    "flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground";

  return (
    <ViewShell
      icon={GlobeIcon}
      title={t("views.bridge.title")}
      description={t("views.bridge.description", { count: audit.length })}
    >
      <div className="flex flex-col gap-3">
        <Collapsible className="flex flex-col gap-2" defaultOpen>
          <CollapsibleTrigger className={sectionClass}>
            {t("views.bridge.mcp_connector")}
            <ChevronDownIcon className="size-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-surface-2/50 p-3 text-start">
              <div className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {t("views.bridge.endpoint")}
                </span>
                <code
                  className="truncate font-mono text-xs"
                  title={connector?.endpoint}
                >
                  {connector?.endpoint ?? "—"}
                </code>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {t("views.bridge.workspace")}
                </span>
                <span
                  className="truncate font-mono text-xs"
                  title={connector?.workspace ?? ""}
                >
                  {connector?.workspace ?? t("views.bridge.no_project_bound")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {t("views.bridge.allowed_hosts")}
                  </span>
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    {t("views.bridge.allowed_hosts_hint")}
                  </span>
                </div>
                <code
                  className="shrink-0 truncate font-mono text-xs"
                  title={connector?.allowed_hosts.join(", ")}
                >
                  {connector?.allowed_hosts.join(", ") || "—"}
                </code>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium">
                    {t("views.bridge.allow_writes")}
                  </span>
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    {t("views.bridge.allow_writes_hint")}
                  </span>
                </div>
                <Switch
                  size="sm"
                  checked={connector?.allow_write ?? false}
                  onCheckedChange={(checked) => {
                    void mcpSetAllowWrite(checked).then(setConnector);
                  }}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="flex flex-col gap-2">
          <CollapsibleTrigger className={sectionClass}>
            {t("views.bridge.tool_sandbox")}
            <ChevronDownIcon className="size-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            <div className="flex min-h-0 flex-col gap-3 rounded-lg border border-border/60 bg-surface-2/50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                <Label className="shrink-0 text-[11px] text-muted-foreground sm:w-28 sm:pb-2">
                  read_file
                </Label>
                <div className="flex min-w-0 flex-1 items-end gap-2">
                  <Input
                    value={readPath}
                    onChange={(e) => setReadPath(e.currentTarget.value)}
                    className="min-w-0 flex-1 font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      void sandboxRun({ ReadFile: { path: readPath } })
                    }
                  >
                    {t("views.bridge.read")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                <Label className="shrink-0 text-[11px] text-muted-foreground sm:w-28 sm:pb-2">
                  write_file
                </Label>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                  <Input
                    value={writePath}
                    placeholder={t("views.bridge.path_placeholder")}
                    onChange={(e) => setWritePath(e.currentTarget.value)}
                    className="min-w-0 flex-1 font-mono text-xs"
                  />
                  <Input
                    value={writeContent}
                    placeholder={t("views.bridge.content_placeholder")}
                    onChange={(e) => setWriteContent(e.currentTarget.value)}
                    className="min-w-0 flex-[2] font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      void sandboxRun({
                        WriteFile: { path: writePath, content: writeContent },
                      })
                    }
                  >
                    {t("views.bridge.write")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                <Label className="shrink-0 text-[11px] text-muted-foreground sm:w-28 sm:pb-2">
                  run_command
                </Label>
                <div className="flex min-w-0 flex-1 items-end gap-2">
                  <Input
                    value={command}
                    placeholder={t("views.bridge.command_placeholder")}
                    onChange={(e) => setCommand(e.currentTarget.value)}
                    className="min-w-0 flex-1 font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      void sandboxRun({ RunCommand: { command } })
                    }
                  >
                    {t("views.bridge.run")}
                  </Button>
                </div>
              </div>
              {sandbox && (
                <ScrollArea className="h-28 min-h-0 rounded-md border border-border/60 bg-background/60 p-3">
                  <pre
                    className={cn(
                      "whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed",
                      sandbox.ok ? "text-foreground" : "text-danger",
                    )}
                  >
                    {sandbox.ok
                      ? sandbox.output
                      : sandbox.error ?? sandbox.pending ?? "?"}
                  </pre>
                </ScrollArea>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="flex flex-col gap-2">
          <CollapsibleTrigger className={sectionClass}>
            {t("views.bridge.audit_trail", { count: audit.length })}
            <ChevronDownIcon className="size-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            <ScrollArea className="h-40 min-h-0 rounded-lg border border-border/60 bg-surface-2/50 p-3">
              {audit.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("views.bridge.no_audit_events")}
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {audit.map((a, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex gap-2 font-mono text-[11px]",
                        !a.allowed && "text-danger",
                      )}
                    >
                      <span className="shrink-0 text-muted-foreground">
                        [{a.ts}]
                      </span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                        {a.agent} · {a.tool} · {a.args} ·{" "}
                        {a.allowed
                          ? `allowed (${a.approved_by})`
                          : "DENIED"}{" "}
                        · {a.ok ? "ok" : "failed"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ViewShell>
  );
}
