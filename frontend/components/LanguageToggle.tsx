"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/context/LanguageContext";

type LanguageOption = {
  code: Language;
  name: string;
  native: string;
  icon: string;
};

const languages: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    native: "English",
    icon: "🇬🇧",
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    icon: "🇮🇳",
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    icon: "🇮🇳",
  },
  {
    code: "hinglish",
    name: "Hinglish",
    native: "Hinglish",
    icon: "💬",
  },
];

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
};

export default function LanguageToggle({
  value,
  onChange,
}: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    languages.find((language) => language.code === value) ??
    languages[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleSelect(language: Language) {
    onChange(language);
    setOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select language"
        aria-expanded={open}
        className="
          group flex h-12 items-center gap-2.5
          rounded-xl border border-green-400/30
          bg-[#07140e]/75 px-3.5
          text-sm font-medium text-white
          shadow-[0_0_18px_rgba(34,197,94,0.06)]
          backdrop-blur-xl transition-all duration-200
          hover:border-green-300/70
          hover:bg-green-500/[0.08]
          hover:shadow-[0_0_24px_rgba(34,197,94,0.16)]
        "
      >
        <span className="text-base">{selected.icon}</span>

        <span className="hidden sm:inline">
          {selected.native}
        </span>

        <span
          className={`
            text-[10px] text-green-200/70
            transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-[58px] z-[100]
            w-60 overflow-hidden rounded-2xl
            border border-green-400/25
            bg-[#06110c]/95 p-2
            shadow-[0_18px_45px_rgba(0,0,0,0.55),0_0_30px_rgba(34,197,94,0.12)]
            backdrop-blur-2xl
          "
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Select Language
            </p>
          </div>

          <div className="space-y-1">
            {languages.map((language) => {
              const active = language.code === value;

              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleSelect(language.code)}
                  className={`
                    flex w-full items-center gap-3 rounded-xl
                    px-3 py-3 text-left
                    transition-all duration-200
                    ${
                      active
                        ? "border border-green-400/20 bg-green-500/15 text-green-100"
                        : "border border-transparent text-white/75 hover:border-green-400/10 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <span className="text-lg">
                    {language.icon}
                  </span>

                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">
                      {language.native}
                    </span>

                    <span className="text-[10px] text-white/35">
                      {language.name}
                    </span>
                  </span>

                  {active && (
                    <span className="text-sm font-bold text-green-300">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}