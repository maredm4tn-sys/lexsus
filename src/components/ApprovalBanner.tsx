import { useState } from "react";
import { ShieldAlertIcon, Trash2Icon } from "lucide-react";
import type { Approval } from "../hooks/useApprovals";
import { Button } from "./ui/button";
import { useTranslation } from "../lib/i18n";

interface ApprovalBannerProps {
  approvals: Approval[];
  onDecide: (
    id: number,
    allow: boolean,
    grant?: { scope: "editing" | "commands"; path_prefix: string | null },
  ) => void;
}

export default function ApprovalBanner({
  approvals,
  onDecide,
}: ApprovalBannerProps) {
  const { t } = useTranslation();
  // Which cards have their "don't ask again" box ticked, by approval id.
  const [grantWanted, setGrantWanted] = useState<Record<number, boolean>>({});

  if (approvals.length === 0) return null;

  function formatGrant(scope: string, prefix: string | null): string {
    if (scope === "commands") return t("approvals.commands");
    return prefix
      ? t("approvals.edits_under", { prefix })
      : t("approvals.edits_in_project");
  }

  return (
    <div className="flex shrink-0 flex-col gap-1.5 border-b border-warning/30 bg-warning/10 px-4 py-2.5 anim-fade-down">
      {approvals.map((a) => {
        const grant = a.grantable;
        const wantsGrant = grantWanted[a.id] ?? false;
        return (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-2.5"
            role="alert"
          >
            {a.destructive ? (
              <Trash2Icon className="size-4 shrink-0 text-danger" />
            ) : (
              <ShieldAlertIcon className="size-4 shrink-0 text-warning" />
            )}
            <p className="min-w-0 flex-1 text-sm">
              <span
                className={`font-semibold ${a.destructive ? "text-danger" : "text-warning"}`}
              >
                {a.source === "mcp"
                  ? t("approvals.web_ai_requests")
                  : t("approvals.desktop_requests")}
              </span>{" "}
              <span className="font-mono text-xs">
                {a.summary}
              </span>
              {a.destructive && (
                <span className="mx-1.5 text-danger">
                  {t("approvals.destructive_warning")}
                </span>
              )}
            </p>
            {grant && (
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-3.5 accent-primary"
                  checked={wantsGrant}
                  onChange={(e) =>
                    setGrantWanted((prev) => ({
                      ...prev,
                      [a.id]: e.target.checked,
                    }))
                  }
                />
                {t("approvals.dont_ask_again", {
                  grant: formatGrant(grant.scope, grant.suggested_prefix),
                })}
              </label>
            )}
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={a.destructive ? "destructive" : "default"}
                disabled={a.resolving}
                onClick={() =>
                  onDecide(
                    a.id,
                    true,
                    grant && wantsGrant
                      ? {
                          scope: grant.scope,
                          path_prefix: grant.suggested_prefix,
                        }
                      : undefined,
                  )
                }
              >
                {t("common.allow")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={a.resolving}
                onClick={() => onDecide(a.id, false)}
              >
                {t("common.deny")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
