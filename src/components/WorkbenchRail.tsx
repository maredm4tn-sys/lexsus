import { useEffect, useState } from "react";
import {
  ActivityIcon,
  BrainIcon,
  FolderOpenIcon,
  GitBranchIcon,
  GlobeIcon,
  MessageCircleIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
  SunIcon,
} from "lucide-react";
import { toggleTheme, useTheme } from "../hooks/useTheme";
import type { McpStatus } from "../lib/types";
import { cn } from "../lib/utils";
import { useTranslation } from "../lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

export type View = "trace" | "git" | "handoff" | "memory" | "bridge";

const RAIL_KEY = "lexsus.railOpen";

const NAV_ITEMS: {
  view: View;
  labelKey: string;
  hintKey: string;
  icon: typeof ActivityIcon;
}[] = [
  {
    view: "trace",
    labelKey: "nav.trace.label",
    hintKey: "nav.trace.hint",
    icon: ActivityIcon,
  },
  {
    view: "git",
    labelKey: "nav.git.label",
    hintKey: "nav.git.hint",
    icon: GitBranchIcon,
  },
  {
    view: "handoff",
    labelKey: "nav.handoff.label",
    hintKey: "nav.handoff.hint",
    icon: MessageCircleIcon,
  },
  {
    view: "memory",
    labelKey: "nav.memory.label",
    hintKey: "nav.memory.hint",
    icon: BrainIcon,
  },
  {
    view: "bridge",
    labelKey: "nav.bridge.label",
    hintKey: "nav.bridge.hint",
    icon: GlobeIcon,
  },
];

interface WorkbenchRailProps {
  view: View;
  onViewChange: (view: View) => void;
  connector: McpStatus | null;
  onOpenProject: () => void;
}

export default function WorkbenchRail({
  view,
  onViewChange,
  connector,
  onOpenProject,
}: WorkbenchRailProps) {
  const { t, dir } = useTranslation();
  const [open, setOpen] = useState(
    () => localStorage.getItem(RAIL_KEY) === "1",
  );
  const theme = useTheme();

  useEffect(() => {
    localStorage.setItem(RAIL_KEY, open ? "1" : "0");
  }, [open]);

  const reveal = cn(
    "grid min-w-0 flex-1 overflow-hidden whitespace-nowrap text-xs font-medium text-start transition-[grid-template-columns,opacity] duration-300 ease-out",
    open ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0",
  );
  const revealInner = cn(
    "col-start-1 row-start-1 min-w-0 truncate",
    dir === "rtl" ? "pl-3" : "pr-3",
  );

  const iconSlot =
    "relative z-10 flex w-13 shrink-0 items-center justify-center [&_svg]:size-4";

  const pill = "absolute inset-y-0 left-2 right-2 rounded-lg";

  const rowBase =
    "relative flex h-9 w-full items-center justify-start px-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-[cubic-bezier(0.22,1,0.36,1)]";

  function renderRow({
    id,
    label,
    hint,
    icon: Icon,
    active = false,
    onClick,
  }: {
    id: string;
    label: string;
    hint: string;
    icon: typeof ActivityIcon;
    active?: boolean;
    onClick: () => void;
  }) {
    const button = (
      <button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
        className={cn(
          rowBase,
          "group text-muted-foreground hover:text-foreground group-hover:[&_svg]:scale-110",
          active && "text-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn(
            pill,
            "transition-colors",
            active ? "bg-muted" : "bg-transparent group-hover:bg-muted/60",
          )}
        />
        <span className={iconSlot}>
          <Icon />
        </span>
        <span className={cn(reveal, "relative z-10")}>
          <span className={revealInner}>{label}</span>
        </span>
      </button>
    );

    return (
      <Tooltip key={id} disabled={open}>
        <TooltipTrigger delay={200} render={button} />
        <TooltipContent
          side={dir === "rtl" ? "left" : "right"}
          sideOffset={10}
          className="max-w-60 flex-col items-start gap-0.5 text-start"
        >
          <span className="font-medium">{label}</span>
          <span className="text-background/70">{hint}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  const collapseText = open ? t("rail.collapse") : t("rail.expand");
  const collapseHint = open ? t("rail.hide_labels") : t("rail.show_labels");

  return (
    <nav
      className={cn(
        "glass-sidebar z-10 flex shrink-0 flex-col border-r py-3",
        "transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        open ? "w-56" : "w-13",
      )}
    >
      <button
        type="button"
        aria-label={collapseText}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          rowBase,
          "group mb-2 text-muted-foreground hover:text-foreground",
        )}
      >
        {!open && (
          <span
            aria-hidden
            className={cn(pill, "bg-transparent group-hover:bg-muted/60")}
          />
        )}
        <span className={iconSlot}>
          {open ? (
            <PanelLeftCloseIcon className={dir === "rtl" ? "rotate-180" : ""} />
          ) : (
            <PanelLeftIcon className={dir === "rtl" ? "rotate-180" : ""} />
          )}
        </span>
      </button>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ view: v, labelKey, hintKey, icon }) =>
          renderRow({
            id: v,
            label: t(labelKey),
            hint: t(hintKey),
            icon,
            active: view === v,
            onClick: () => onViewChange(v),
          }),
        )}
      </div>

      <div className="grow" />

      <div className="flex flex-col gap-0.5">
        <Tooltip disabled={open}>
          <TooltipTrigger
            delay={200}
            render={
              <button
                type="button"
                aria-label={collapseText}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className={cn(
                  rowBase,
                  "group mb-2 text-muted-foreground hover:text-foreground",
                )}
              />
            }
          />
          <TooltipContent
            side={dir === "rtl" ? "left" : "right"}
            sideOffset={10}
            className="max-w-40 flex-col items-start gap-0.5 text-start"
          >
            <span className="font-medium">{collapseText}</span>
            <span className="text-background/70">{collapseHint}</span>
          </TooltipContent>
        </Tooltip>

        {renderRow({
          id: "theme",
          label: theme === "dark" ? t("rail.dark_theme") : t("rail.light_theme"),
          hint:
            theme === "dark"
              ? t("rail.switch_light")
              : t("rail.switch_dark"),
          icon: theme === "dark" ? MoonIcon : SunIcon,
          onClick: toggleTheme,
        })}

        {renderRow({
          id: "project",
          label: t("rail.project_connector"),
          hint: t("rail.project_connector_hint"),
          icon: FolderOpenIcon,
          onClick: onOpenProject,
        })}

        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={
              <span
                aria-label={
                  connector?.listening
                    ? t("rail.connector_status")
                    : t("rail.connector_offline")
                }
                className="relative flex h-9 w-full items-center text-xs text-muted-foreground"
              >
                <span className={iconSlot}>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      connector?.listening
                        ? connector.allow_write
                          ? "bg-warning anim-pulse"
                          : "bg-success anim-pulse"
                        : "bg-muted-foreground/40",
                    )}
                  />
                </span>
                <span className={cn(reveal, "relative z-10 font-normal")}>
                  <span className={revealInner}>
                    {connector?.listening
                      ? connector.allow_write
                        ? t("rail.connector_listening_rw")
                        : t("rail.connector_listening_ro")
                      : t("rail.connector_offline")}
                  </span>
                </span>
              </span>
            }
          />
          <TooltipContent
            side={dir === "rtl" ? "left" : "right"}
            sideOffset={10}
            className="max-w-52 flex-col items-start gap-0.5 text-start"
          >
            <span className="font-medium">{t("rail.connector_status")}</span>
            <span className="text-background/70">
              {connector?.listening
                ? connector.allow_write
                  ? t("rail.status_rw_desc")
                  : t("rail.status_ro_desc")
                : t("rail.status_offline_desc")}
            </span>
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
