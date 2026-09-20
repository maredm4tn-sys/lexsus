"use client";

import { useEffect, useState } from "react";
import {
  ActivityIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainIcon,
  FolderOpenIcon,
  GitBranchIcon,
  GlobeIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { markOnboarded } from "../lib/onboarding";
import { useTranslation } from "../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const TOUR_ICONS = [
  FolderOpenIcon,
  ActivityIcon,
  ShieldCheckIcon,
  GitBranchIcon,
  MessageCircleIcon,
  BrainIcon,
  GlobeIcon,
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, dir } = useTranslation();
  const [phase, setPhase] = useState<"hello" | "tour">("hello");
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);

  const helloWord = t("onboarding.hello");
  const helloDone = typed >= helloWord.length;

  // Typewriter: reveal one character at a time, then stop.
  useEffect(() => {
    if (phase !== "hello" || helloDone) return;
    const delay = typed === 0 ? 350 : 170;
    const tTimer = setTimeout(() => setTyped((n) => n + 1), delay);
    return () => clearTimeout(tTimer);
  }, [phase, typed, helloDone]);

  function finish() {
    markOnboarded();
    onDone();
  }

  const Icon = TOUR_ICONS[index] || FolderOpenIcon;

  return (
    <div className="onboard-screen fixed inset-0 z-[60] flex flex-col overflow-hidden bg-black text-white" dir={dir}>
      {/* Top bar with language switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSwitcher className="text-white/70 hover:text-white hover:bg-white/10" />
      </div>

      {phase === "hello" ? (
        <div className="relative flex flex-1 flex-col items-center justify-center px-6">
          <div aria-hidden className="onboard-glow" />
          <h1 className="onboard-hello" aria-label={helloWord}>
            <span aria-hidden className="invisible">
              {helloWord}
            </span>
            <span aria-hidden className="absolute inset-0">
              {helloWord.slice(0, typed)}
            </span>
          </h1>
          <p
            className="anim-fade-up mt-6 text-center text-sm text-white/50"
            style={{ animationPlayState: helloDone ? "running" : "paused" }}
          >
            {t("onboarding.tagline")}
          </p>
          <Button
            size="lg"
            onClick={() => setPhase("tour")}
            className="anim-fade-up mt-12 h-11 px-6 text-sm"
            style={{
              animationDelay: "90ms",
              animationPlayState: helloDone ? "running" : "paused",
            }}
          >
            {t("onboarding.get_started")}
            <ArrowRightIcon className={dir === "rtl" ? "mr-1.5 size-4 rotate-180" : "ml-1.5 size-4"} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="w-full max-w-lg">
            <div className="flex items-center justify-between">
              <span className="app-eyebrow text-white/35 font-mono">
                {index + 1} / {TOUR_ICONS.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={finish}
                className="text-white/50 hover:bg-white/10 hover:text-white"
              >
                {t("onboarding.skip_tour")}
              </Button>
            </div>

            <div
              key={index}
              className="anim-fade-up mt-10 flex flex-col items-start gap-4 text-start"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-primary ring-1 ring-white/10">
                <Icon className="size-6" />
              </span>
              <span className="app-eyebrow text-primary/80">
                {t(`onboarding.steps.${index}.eyebrow`)}
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {t(`onboarding.steps.${index}.title`)}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/55">
                {t(`onboarding.steps.${index}.desc`)}
              </p>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {TOUR_ICONS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 ease-out",
                      i === index
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-white/20 hover:bg-white/40",
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setIndex((i) => i - 1)}
                    className="text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeftIcon className={dir === "rtl" ? "ml-1 size-4 rotate-180" : "mr-1 size-4"} />
                    {dir === "rtl" ? "السابق" : "Back"}
                  </Button>
                )}
                {index < TOUR_ICONS.length - 1 ? (
                  <Button onClick={() => setIndex((i) => i + 1)}>
                    {t("onboarding.next")}
                    <ArrowRightIcon className={dir === "rtl" ? "mr-1 size-4 rotate-180" : "ml-1 size-4"} />
                  </Button>
                ) : (
                  <Button onClick={finish}>{t("onboarding.get_started")}</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
