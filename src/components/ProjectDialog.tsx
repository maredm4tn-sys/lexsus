import { Chip } from "@heroui/react";
import { FolderIcon, FolderOpenIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import type { McpStatus } from "../lib/types";
import { useTranslation } from "../lib/i18n";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectRoot: string;
  recents: string[];
  connector: McpStatus | null;
  onPick: (path: string) => void;
  onBrowse: () => void;
}

export default function ProjectDialog({
  open,
  onOpenChange,
  projectRoot,
  recents,
  connector,
  onPick,
  onBrowse,
}: ProjectDialogProps) {
  const { t, dir } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-start" dir={dir}>
        <DialogHeader>
          <DialogTitle>{t("project_dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("project_dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="app-eyebrow text-muted-foreground">{t("project_dialog.working_directory")}</p>
            {projectRoot && (
              <p
                className="truncate rounded-md border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-xs"
                title={projectRoot}
              >
                {projectRoot}
              </p>
            )}
            <div className="mt-1 flex flex-col gap-0.5">
              {recents.length === 0 && !projectRoot && (
                <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                  {t("project_dialog.no_folders_yet")}
                </p>
              )}
              {recents.map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 font-mono text-xs"
                  onClick={() => {
                    onPick(p);
                    onOpenChange(false);
                  }}
                >
                  <FolderIcon className="shrink-0 text-muted-foreground" />
                  <span className="truncate" title={p}>
                    {p}
                  </span>
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 justify-start gap-2"
              onClick={() => {
                onBrowse();
                onOpenChange(false);
              }}
            >
              <FolderOpenIcon className="size-4" /> {t("project_dialog.browse_folder")}
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="app-eyebrow text-muted-foreground">{t("project_dialog.connector")}</p>
            <div className="flex items-center justify-between gap-2">
              <Chip
                color={connector?.listening ? "success" : "default"}
                variant="soft"
                size="sm"
              >
                {connector?.listening ? t("project_dialog.listening") : t("project_dialog.offline")}
              </Chip>
              {connector ? (
                <code
                  className="truncate rounded-md border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs"
                  title={connector.endpoint}
                >
                  {connector.endpoint}
                </code>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t("project_dialog.endpoint")}
                </span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("views.bridge.allowed_hosts_hint")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
