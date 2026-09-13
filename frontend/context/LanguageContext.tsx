"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { en } from "@/translations/en";
import { hi } from "@/translations/hi";
import { bn } from "@/translations/bn";
import { hinglish } from "@/translations/hinglish";

export type Language = "en" | "hi" | "bn" | "hinglish";

const translations = {
  en,
  hi,
  bn,
  hinglish,
};

type TranslationKey = keyof typeof en;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "agriAI_language"
    );

    if (
      savedLanguage === "en" ||
      savedLanguage === "hi" ||
      savedLanguage === "bn" ||
      savedLanguage === "hinglish"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  function setLanguage(newLanguage: Language) {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "agriAI_language",
      newLanguage
    );
  }

  function t(key: TranslationKey): string {
    const currentTranslations = translations[language];

    return (
      currentTranslations[key] ??
      translations.en[key] ??
      key
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}