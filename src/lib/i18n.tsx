import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

export type Language = "ar" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: "rtl" | "ltr";
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = "lexsus.language";

const translations: Record<Language, typeof en> = {
  en,
  ar: ar as unknown as typeof en,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let curr = obj;
  for (const part of parts) {
    if (curr == null || typeof curr !== "object") return undefined;
    curr = (curr as Record<string, unknown>)[part];
  }
  return typeof curr === "string" ? curr : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "ar" ? saved : "ar";
  });

  const [, startTransition] = useTransition();

  const dir: "rtl" | "ltr" = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
    if (dir === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    startTransition(() => {
      setLanguageState(lang);
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language];
    const fallbackDict = translations.en;

    let text = getNestedValue(currentDict, key) ?? getNestedValue(fallbackDict, key) ?? key;

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.split(`{${paramKey}}`).join(String(paramVal));
      }
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, dir, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
