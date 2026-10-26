import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DICTIONARY, PHRASE_LOOKUP, Language } from '../i18n/translations';

export type { Language };
export type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: (keyOrPhrase: string) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language state with localStorage persistence
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tegagn_lang') as Language | null;
      if (saved && (saved === 'en' || saved === 'am' || saved === 'om')) {
        return saved;
      }
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tegagn_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  // 2. Theme state with localStorage persistence
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tegagn_theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tegagn_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Comprehensive t function that translates direct keys, direct English phrases, and normalized strings
  const t = (keyOrPhrase: string): string => {
    if (!keyOrPhrase) return '';

    // If English is selected and the input is already in English, return it or its canonical version
    if (lang === 'en') {
      if (DICTIONARY.en[keyOrPhrase]) return DICTIONARY.en[keyOrPhrase];
      if (PHRASE_LOOKUP[keyOrPhrase]?.en) return PHRASE_LOOKUP[keyOrPhrase].en;
      return keyOrPhrase;
    }

    // 1. Direct dictionary key match in current language
    if (DICTIONARY[lang]?.[keyOrPhrase]) {
      return DICTIONARY[lang][keyOrPhrase];
    }

    // 2. Direct exact phrase lookup
    if (PHRASE_LOOKUP[keyOrPhrase]?.[lang]) {
      return PHRASE_LOOKUP[keyOrPhrase][lang];
    }

    // 3. Normalized / case-insensitive search in PHRASE_LOOKUP
    const trimmed = keyOrPhrase.trim();
    const lower = trimmed.toLowerCase();

    for (const [enPhrase, translations] of Object.entries(PHRASE_LOOKUP)) {
      if (enPhrase.toLowerCase() === lower) {
        return translations[lang] || translations.en || keyOrPhrase;
      }
    }

    // 4. Case-insensitive search in DICTIONARY.en
    for (const [key, enVal] of Object.entries(DICTIONARY.en)) {
      if (key.toLowerCase() === lower || enVal.trim().toLowerCase() === lower) {
        return DICTIONARY[lang]?.[key] || DICTIONARY.en[key] || keyOrPhrase;
      }
    }

    // 5. Fallback
    return DICTIONARY.en[keyOrPhrase] || keyOrPhrase;
  };

  return (
    <ThemeLanguageContext.Provider value={{ lang, setLang, theme, setTheme, toggleTheme, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
