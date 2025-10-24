import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, interpolate } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (namespace: string, key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'personality-test-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'en' || saved === 'ko') ? saved : 'ko';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (namespace: string, key: string, params?: Record<string, string | number>): string => {
    try {
      const translation = translations[language];
      const namespaceObj = translation[namespace as keyof typeof translation];
      
      if (!namespaceObj || typeof namespaceObj !== 'object') {
        console.warn(`Namespace "${namespace}" not found in translations for language "${language}"`);
        return key;
      }

      const value = namespaceObj[key as keyof typeof namespaceObj];
      
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found in namespace "${namespace}" for language "${language}"`);
        return key;
      }

      const text = String(value);
      
      if (params) {
        return interpolate(text, params);
      }

      return text;
    } catch (error) {
      console.error(`Translation error for ${namespace}.${key}:`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
