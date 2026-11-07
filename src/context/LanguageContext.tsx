import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const current = useRef<UiLanguage>('es');
  const changes = useRef(0);
  const pending = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    const revision = changes.current;
    void getPrefs()
      .then((prefs) => {
        if (active && revision === changes.current) {
          current.current = prefs.uiLanguage;
          setLanguageState(prefs.uiLanguage);
        }
      })
      .catch(() => {
        // Keep the current language usable; an explicit change can retry storage.
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  const changeLanguage = useCallback((nextLanguage?: UiLanguage) => {
    changes.current++;
    const operation = pending.current.then(async () => {
      const next = nextLanguage ?? (current.current === 'es' ? 'en' : 'es');
      try {
        await setPrefs({ uiLanguage: next });
      } catch (error) {
        // A rejected write may have committed a roll-forward journal. Reading
        // through durable storage recovers it before confirming the UI value.
        const recovered = await getPrefs().catch(() => undefined);
        if (recovered?.uiLanguage !== next) throw error;
      }
      current.current = next;
      if (mounted.current) setLanguageState(next);
      // Refresh copy without prompting for permission or undoing a saved language
      // if the native scheduler is unavailable. Its own screen exposes recovery.
      void Promise.resolve()
        .then(() => {
          // Load the native notification module only for a saved language change.
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { refreshScheduledNotifications } =
            require('../services/notifications') as typeof import('../services/notifications');
          return refreshScheduledNotifications();
        })
        .catch(() => {});
    });
    pending.current = operation.catch(() => {});
    return operation;
  }, []);

  const setLanguage = useCallback(
    (nextLanguage: UiLanguage) => changeLanguage(nextLanguage),
    [changeLanguage],
  );
  const toggleLanguage = useCallback(() => changeLanguage(), [changeLanguage]);

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
