"use client";

import React, { createContext, useContext, useState } from "react";
import { Language } from "@/types/il8n";
import {
  HEADER_DICTIONARY,
  SEARCH_DICTIONARY,
  DEFAULT_NAV_ITEMS,
} from "@/constants/navigation";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: {
    header: (typeof HEADER_DICTIONARY)[Language];
    search: (typeof SEARCH_DICTIONARY)[Language];
    nav: (typeof DEFAULT_NAV_ITEMS)[Language];
  };
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const setLanguageCookie = (lang: Language) => {
  document.cookie = `app_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
};

export function LanguageProvider({
  children,
  initialLang = "ko",
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setLanguageCookie(newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === "ko" ? "en" : "ko";
    setLang(nextLang);
  };

  const t = {
    header: HEADER_DICTIONARY[lang],
    search: SEARCH_DICTIONARY[lang],
    nav: DEFAULT_NAV_ITEMS[lang],
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
