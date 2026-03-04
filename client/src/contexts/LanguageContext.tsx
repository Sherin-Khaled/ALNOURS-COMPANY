import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/i18n/en.json";
import ar from "@/i18n/ar.json";

type Locale = "en" | "ar";
type Translations = typeof en;

interface LanguageContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const translations: Record<Locale, Translations> = { en, ar };

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  dir: "ltr",
  t: en,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("alnours-lang");
    return (saved === "ar" ? "ar" : "en") as Locale;
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("alnours-lang", l);
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.style.fontFamily =
      locale === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', 'Sora', sans-serif";
  }, [locale]);

  const value: LanguageContextType = {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    t: translations[locale],
    setLocale,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
