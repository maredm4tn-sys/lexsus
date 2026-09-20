import { getCurrentWindow } from "@tauri-apps/api/window";
import { CopyMinusIcon, CopyPlusIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const appWindow = getCurrentWindow();

/**
 * Custom titlebar replacing the system (GTK) headerbar: title on the
 * left, window controls on the right, the whole strip draggable via
 * `data-tauri-drag-region` (works on X11 and Wayland).
 */
export default function Titlebar() {
  const { t } = useTranslation();

  return (
    <header
      data-tauri-drag-region
      className="glass-sidebar flex h-10 shrink-0 select-none items-center border-b px-3"
    >
      <p
        data-tauri-drag-region
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        {t("app.name")}
      </p>

      <div className="ml-auto flex h-full items-center gap-1">
        <LanguageSwitcher />

        <div className="flex h-full items-stretch">
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("common.minimize")}
            className="h-full rounded-none px-3.5 hover:bg-muted"
            onClick={() => void appWindow.minimize()}
          >
            <CopyMinusIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("common.maximize")}
            className="h-full rounded-none px-3.5 hover:bg-muted"
            onClick={() => void appWindow.toggleMaximize()}
          >
            <CopyPlusIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("common.close")}
            className="h-full rounded-none px-3.5 hover:bg-danger hover:text-danger-foreground"
            onClick={() => void appWindow.close()}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
