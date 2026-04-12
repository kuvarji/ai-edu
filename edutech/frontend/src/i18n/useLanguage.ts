import { useState, useCallback } from 'react';
import translations, { type Language } from './translations';

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'hinglish';
  const stored = localStorage.getItem('app_language');
  if (stored === 'hindi' || stored === 'english' || stored === 'hinglish') return stored;
  return 'hinglish';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const t = translations[language];

  return { language, setLanguage, t };
}

export type { Language };
export { translations };
