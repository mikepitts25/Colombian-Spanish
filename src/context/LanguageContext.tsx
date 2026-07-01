import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { translate, TranslationKey } from '../i18n/translations';
import { getPrefs, setPrefs, UiLanguage } from '../storage/prefs';

type LanguageContextValue = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const fallbackLanguageContext: LanguageContextValue = {
  language: 'es',
  setLanguage: async () => {},
  toggleLanguage: async () => {},
  t: (key, values) => translate('es', key, values),
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>('es');

  useEffect(() => {
    (async () => {
      const prefs = await getPrefs();
      setLanguageState(prefs.uiLanguage);
    })();
  }, []);

  const setLanguage = useCallback(async (nextLanguage: UiLanguage) => {
    setLanguageState(nextLanguage);
    await setPrefs({ uiLanguage: nextLanguage });
  }, []);

  const toggleLanguage = useCallback(async () => {
    await setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) =>
      translate(language, key, values),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? fallbackLanguageContext;
}
