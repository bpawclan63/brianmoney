import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationKey, TranslationSubKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T extends TranslationKey>(section: T, key: TranslationSubKey<T>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'flowly-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'id' || saved === 'en') return saved;
    }
    return 'id'; // Default to Indonesian
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = <T extends TranslationKey>(section: T, key: TranslationSubKey<T>): string => {
    const sectionData = translations[section];
    if (!sectionData) return String(key);
    
    const keyData = sectionData[key as keyof typeof sectionData];
    if (!keyData) return String(key);
    
    return (keyData as Record<Language, string>)[language] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
