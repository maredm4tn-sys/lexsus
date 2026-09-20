import { LanguagesIcon } from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { Button } from "./ui/button";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { language, toggleLanguage } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className={`h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground ${className ?? ""}`}
    >
      <LanguagesIcon className="size-3.5" />
      <span>{language === "ar" ? "English" : "عربي"}</span>
    </Button>
  );
}
