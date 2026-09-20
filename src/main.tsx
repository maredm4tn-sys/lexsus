import React from "react";
import ReactDOM from "react-dom/client";
import { I18nProvider } from "@heroui/react";
import { I18nProvider as AppI18nProvider } from "./lib/i18n";
import App from "./App";
import { Toaster } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { applyTheme, loadTheme } from "./hooks/useTheme";
import "./index.css";
import "./App.css";

applyTheme(loadTheme());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppI18nProvider>
      <I18nProvider locale="en">
        <TooltipProvider>
          <Toaster>
            <App />
          </Toaster>
        </TooltipProvider>
      </I18nProvider>
    </AppI18nProvider>
  </React.StrictMode>,
);