'use client'

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import { track } from '@/lib/track';

type Language = 'en' | 'fr';
type Dict = typeof fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  /** Full structured dictionary for the current language (nested content). */
  dict: Dict;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Dict> = { en: en as Dict, fr };

/* Language choice kept in local storage (and in memory when storage is unavailable), read with
   useSyncExternalStore: the server and hydration render French, then the saved choice applies. */
const STORAGE_KEY = 'language';
const listeners = new Set<() => void>();
let chosen: Language | null = null;

function readLanguage(): Language {
  if (chosen) return chosen;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange); // choice made in another tab
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useSyncExternalStore(subscribe, readLanguage, () => 'fr' as Language);

  const handleSetLanguage = (lang: Language) => {
    chosen = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    listeners.forEach((notify) => notify());
    track('language', { to: lang });
  };

  const t = (key: string): string => {
    const val = (translations[language] as unknown as Record<string, unknown>)?.[key];
    return typeof val === 'string' ? val : key;
  };

  const dict = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * For pages that switch FR/EN client-side: mirrors the language on <html lang>
 * and, when given, on the document title and meta description.
 */
export function useLocalizedDocument(meta?: { title: string; description: string }) {
  const { language } = useLanguage();
  const title = meta?.title;
  const description = meta?.description;

  useEffect(() => {
    document.documentElement.lang = language;
    if (title) document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    // The rest of the site (blog) is French
    return () => {
      document.documentElement.lang = 'fr';
    };
  }, [language, title, description]);
}
