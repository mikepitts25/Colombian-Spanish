import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { translate, TranslationKey } from '../i18n/translations';
import { getPrefs, setPrefs, UiLanguage } from '../storage/prefs';

type LanguageContextValue = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>('es');

  useEffect(() => {
    (async () => {
      const prefs = await getPrefs();
      setLanguageState(prefs.uiLanguage);
    })();
  }, []);

  async function setLanguage(nextLanguage: UiLanguage) {
    setLanguageState(nextLanguage);
    await setPrefs({ uiLanguage: nextLanguage });
  }

  async function toggleLanguage() {
    await setLanguage(language === 'es' ? 'en' : 'es');
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey, values?: Record<string, string | number>) =>
        translate(language, key, values),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
