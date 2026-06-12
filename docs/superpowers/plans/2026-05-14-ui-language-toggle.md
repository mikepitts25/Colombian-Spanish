# UI Language Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Settings language toggle that switches app UI chrome between Spanish and English while keeping Spanish as the default.

**Architecture:** Store `uiLanguage` in the existing prefs storage, expose it through a focused `LanguageProvider`, and use a small typed translation dictionary for UI labels. Wrap the app in the provider so navigation and screens can translate labels immediately after a toggle.

**Tech Stack:** Expo, React Native, TypeScript, React Context, AsyncStorage, Jest, React Native Testing Library.

---

## File Structure

- Modify: `src/storage/prefs.ts` to add `UiLanguage`, default validation, and persistence through the existing prefs API.
- Create: `src/i18n/translations.ts` for typed translation keys and English/Spanish dictionaries.
- Create: `src/context/LanguageContext.tsx` for `LanguageProvider` and `useLanguage`.
- Modify: `App.tsx` to wrap the app tree with `LanguageProvider`.
- Modify: `src/navigation/index.tsx` to translate bottom tabs and stack titles.
- Modify: `src/screens/SettingsScreen.tsx` to translate labels, alerts, and add the language toggle row.
- Modify: `__tests__/storage/prefs.test.ts` for default, valid, and invalid `uiLanguage` storage behavior.
- Modify: `__tests__/screens/SettingsScreen.test.tsx` for the language row and toggle behavior.

---

### Task 1: Persist UI Language In Prefs

**Files:**
- Modify: `__tests__/storage/prefs.test.ts`
- Modify: `src/storage/prefs.ts`

- [ ] **Step 1: Write failing prefs tests**

Add these tests in `__tests__/storage/prefs.test.ts`:

```ts
it('returns Spanish as the default UI language when storage is empty', async () => {
  const prefs = await getPrefs();
  expect(prefs.uiLanguage).toBe('es');
});

it('returns a saved English UI language', async () => {
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ autoSpeak: false, speechRate: 1.0, uiLanguage: 'en' }),
  );
  const prefs = await getPrefs();
  expect(prefs.uiLanguage).toBe('en');
});

it('falls back to Spanish when stored UI language is invalid', async () => {
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ autoSpeak: false, speechRate: 1.0, uiLanguage: 'fr' }),
  );
  const prefs = await getPrefs();
  expect(prefs.uiLanguage).toBe('es');
});

it('round-trip: set then get persists uiLanguage', async () => {
  await setPrefs({ uiLanguage: 'en' });
  const prefs = await getPrefs();
  expect(prefs.uiLanguage).toBe('en');
});
```

- [ ] **Step 2: Run the focused prefs test and verify RED**

Run: `npm test -- --runTestsByPath __tests__/storage/prefs.test.ts`

Expected: FAIL because `uiLanguage` is not defined on `Prefs`.

- [ ] **Step 3: Implement minimal prefs support**

Update `src/storage/prefs.ts`:

```ts
export type UiLanguage = 'es' | 'en';

export type Prefs = {
  autoSpeak: boolean;
  speechRate: number;
  uiLanguage: UiLanguage;
};

const DEFAULTS: Prefs = {
  autoSpeak: false,
  speechRate: 0.98,
  uiLanguage: 'es',
};

function normalizeUiLanguage(value: unknown): UiLanguage {
  return value === 'en' || value === 'es' ? value : DEFAULTS.uiLanguage;
}
```

Return `uiLanguage: normalizeUiLanguage(parsed.uiLanguage)` inside `getPrefs()`.

- [ ] **Step 4: Run the focused prefs test and verify GREEN**

Run: `npm test -- --runTestsByPath __tests__/storage/prefs.test.ts`

Expected: PASS.

---

### Task 2: Add Translation Dictionary And Language Provider

**Files:**
- Create: `src/i18n/translations.ts`
- Create: `src/context/LanguageContext.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Add translation module**

Create `src/i18n/translations.ts`:

```ts
import { UiLanguage } from '../storage/prefs';

export const translations = {
  es: {
    'tabs.home': 'INICIO',
    'tabs.study': 'ESTUDIAR',
    'tabs.browse': 'BUSCAR',
    'tabs.progress': 'PROGRESO',
    'tabs.settings': 'AJUSTES',
    'settings.title': 'Ajustes',
    'settings.section.learning': 'APRENDIZAJE',
    'settings.section.account': 'CUENTA',
    'settings.section.about': 'SOBRE LA APP',
    'settings.dailyGoal.title': 'Meta Diaria',
    'settings.dailyGoal.subtitle': '{count} tarjetas por día',
    'settings.newCards.title': 'Nuevas Tarjetas',
    'settings.newCards.subtitle': '20 por día',
    'settings.reminders.title': 'Recordatorios',
    'settings.reminders.subtitle': '8:00 AM todos los días',
    'settings.profile.title': 'Editar Perfil',
    'settings.profile.subtitle': 'Nombre, foto, idioma',
    'settings.language.title': 'Idioma de interfaz',
    'settings.language.subtitle': 'Español',
    'settings.export.title': 'Exportar Backup',
    'settings.export.subtitle': 'Copia tus decks al portapapeles',
    'settings.import.title': 'Importar Backup',
    'settings.import.subtitle': 'Restaurar desde portapapeles',
    'settings.rate.title': 'Calificar la App',
    'settings.version.title': 'Versión',
    'settings.signOut': 'Cerrar Sesión',
    'settings.streak': '{count} día{plural} de racha',
    'settings.alert.backupCopied.title': 'Backup copiado',
    'settings.alert.backupCopied.message': 'Tu backup fue copiado al portapapeles.',
    'settings.alert.emptyClipboard.title': 'Nada que importar',
    'settings.alert.emptyClipboard.message': 'El portapapeles está vacío.',
    'settings.alert.invalidJson.title': 'JSON inválido',
    'settings.alert.invalidJson.message': 'El portapapeles no contiene JSON válido.',
    'settings.alert.notBackup.title': 'No es un backup',
    'settings.alert.notBackup.message': 'El JSON no es un backup de esta app.',
    'settings.alert.invalidBackup.title': 'Backup inválido',
    'settings.alert.invalidBackup.message': 'El backup no tiene decks.',
    'settings.alert.importConfirm.title': '¿Importar backup?',
    'settings.alert.importConfirm.message': 'Esto reemplazará tus decks y progreso actuales.',
    'settings.alert.cancel': 'Cancelar',
    'settings.alert.import': 'Importar',
    'settings.alert.imported.title': 'Importado',
    'settings.alert.imported.message': 'Reinicia la app si algo se ve desactualizado.',
    'settings.alert.signOut.title': '¿Cerrar sesión?',
    'settings.alert.signOut.message': 'Esta app es offline. No hay sesión que cerrar 🙂',
    'nav.manageDecks': 'Gestionar Decks',
    'nav.review': 'Revisión',
    'nav.flagged': 'Marcadas',
  },
  en: {
    'tabs.home': 'HOME',
    'tabs.study': 'STUDY',
    'tabs.browse': 'BROWSE',
    'tabs.progress': 'PROGRESS',
    'tabs.settings': 'SETTINGS',
    'settings.title': 'Settings',
    'settings.section.learning': 'LEARNING',
    'settings.section.account': 'ACCOUNT',
    'settings.section.about': 'ABOUT THE APP',
    'settings.dailyGoal.title': 'Daily Goal',
    'settings.dailyGoal.subtitle': '{count} cards per day',
    'settings.newCards.title': 'New Cards',
    'settings.newCards.subtitle': '20 per day',
    'settings.reminders.title': 'Reminders',
    'settings.reminders.subtitle': '8:00 AM every day',
    'settings.profile.title': 'Edit Profile',
    'settings.profile.subtitle': 'Name, photo, language',
    'settings.language.title': 'UI language',
    'settings.language.subtitle': 'English',
    'settings.export.title': 'Export Backup',
    'settings.export.subtitle': 'Copy your decks to the clipboard',
    'settings.import.title': 'Import Backup',
    'settings.import.subtitle': 'Restore from clipboard',
    'settings.rate.title': 'Rate the App',
    'settings.version.title': 'Version',
    'settings.signOut': 'Sign Out',
    'settings.streak': '{count} day{plural} streak',
    'settings.alert.backupCopied.title': 'Backup copied',
    'settings.alert.backupCopied.message': 'Your backup was copied to the clipboard.',
    'settings.alert.emptyClipboard.title': 'Nothing to import',
    'settings.alert.emptyClipboard.message': 'The clipboard is empty.',
    'settings.alert.invalidJson.title': 'Invalid JSON',
    'settings.alert.invalidJson.message': 'The clipboard does not contain valid JSON.',
    'settings.alert.notBackup.title': 'Not a backup',
    'settings.alert.notBackup.message': 'The JSON is not a backup from this app.',
    'settings.alert.invalidBackup.title': 'Invalid backup',
    'settings.alert.invalidBackup.message': 'The backup has no decks.',
    'settings.alert.importConfirm.title': 'Import backup?',
    'settings.alert.importConfirm.message': 'This will replace your current decks and progress.',
    'settings.alert.cancel': 'Cancel',
    'settings.alert.import': 'Import',
    'settings.alert.imported.title': 'Imported',
    'settings.alert.imported.message': 'Restart the app if anything looks out of date.',
    'settings.alert.signOut.title': 'Sign out?',
    'settings.alert.signOut.message': 'This app is offline. There is no session to sign out of 🙂',
    'nav.manageDecks': 'Manage Decks',
    'nav.review': 'Review',
    'nav.flagged': 'Flagged',
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function translate(
  language: UiLanguage,
  key: TranslationKey,
  values: Record<string, string | number> = {},
) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translations[language][key],
  );
}
```

- [ ] **Step 2: Add provider**

Create `src/context/LanguageContext.tsx`:

```tsx
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { getPrefs, setPrefs, UiLanguage } from '../storage/prefs';
import { translate, TranslationKey } from '../i18n/translations';

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
```

- [ ] **Step 3: Wrap app tree**

In `App.tsx`, import `LanguageProvider` and wrap `RootNavigator`:

```tsx
import { LanguageProvider } from './src/context/LanguageContext';
```

```tsx
<DeckProvider>
  <LanguageProvider>
    <StatusBar style="light" />
    <RootNavigator />
  </LanguageProvider>
</DeckProvider>
```

---

### Task 3: Localize Settings And Navigation

**Files:**
- Modify: `__tests__/screens/SettingsScreen.test.tsx`
- Modify: `src/screens/SettingsScreen.tsx`
- Modify: `src/navigation/index.tsx`

- [ ] **Step 1: Write failing Settings tests**

Mock the language context in `__tests__/screens/SettingsScreen.test.tsx`:

```ts
const mockToggleLanguage = jest.fn();
let mockLanguage = 'es';

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      language: mockLanguage,
      toggleLanguage: mockToggleLanguage,
      setLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) =>
        translate(mockLanguage, key, values),
    }),
  };
});
```

Reset `mockLanguage = 'es'` and `mockToggleLanguage.mockClear()` in `beforeEach`.

Add tests:

```ts
it('renders the UI language row in Spanish by default', async () => {
  const { getByText } = render(<SettingsScreen />);
  await waitFor(() => expect(getByText('Idioma de interfaz')).toBeTruthy());
  expect(getByText('Español')).toBeTruthy();
});

it('calls toggleLanguage when the UI language row is pressed', async () => {
  const { getByText } = render(<SettingsScreen />);
  await waitFor(() => getByText('Idioma de interfaz'));
  fireEvent.press(getByText('Idioma de interfaz'));
  expect(mockToggleLanguage).toHaveBeenCalledTimes(1);
});

it('renders Settings copy in English when language is English', async () => {
  mockLanguage = 'en';
  const { getByText } = render(<SettingsScreen />);
  await waitFor(() => expect(getByText('Settings')).toBeTruthy());
  expect(getByText('UI language')).toBeTruthy();
  expect(getByText('English')).toBeTruthy();
});
```

- [ ] **Step 2: Run Settings tests and verify RED**

Run: `npm test -- --runTestsByPath __tests__/screens/SettingsScreen.test.tsx`

Expected: FAIL because `SettingsScreen` does not consume `useLanguage` and does not render the language row.

- [ ] **Step 3: Update Settings screen**

In `src/screens/SettingsScreen.tsx`, import and use `useLanguage`:

```ts
import { useLanguage } from '../context/LanguageContext';
```

Inside the component:

```ts
const { t, toggleLanguage } = useLanguage();
```

Replace hard-coded labels with `t(...)`, including:

```tsx
<Text style={styles.pageTitle}>⚙️  {t('settings.title')}</Text>
```

Add the row after profile:

```tsx
<SettingsRow
  emoji="🌐"
  title={t('settings.language.title')}
  subtitle={t('settings.language.subtitle')}
  onPress={toggleLanguage}
/>
```

Update daily target and streak copy:

```tsx
subtitle={t('settings.dailyGoal.subtitle', { count: target })}
```

```tsx
{t('settings.streak', { count: streak, plural: streak !== 1 ? 's' : '' })}
```

Replace `Alert.alert(...)` strings with translation keys from `translations.ts`.

- [ ] **Step 4: Update navigation labels**

In `src/navigation/index.tsx`, import `useLanguage`, change tab labels to translation keys, and translate in `CustomTabBar`:

```ts
import { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';
```

```ts
const TABS: Array<{ name: string; labelKey: TranslationKey; icon: string }> = [
  { name: 'Home', labelKey: 'tabs.home', icon: '🏠' },
  { name: 'Study', labelKey: 'tabs.study', icon: '📖' },
  { name: 'Browse', labelKey: 'tabs.browse', icon: '🔍' },
  { name: 'Progress', labelKey: 'tabs.progress', icon: '📊' },
  { name: 'Settings', labelKey: 'tabs.settings', icon: '⚙️' },
];
```

```tsx
const { t } = useLanguage();
```

```tsx
{t(tab.labelKey)}
```

Use `t('nav.manageDecks')`, `t('nav.review')`, and `t('nav.flagged')` in `RootNavigator`.

- [ ] **Step 5: Run Settings tests and verify GREEN**

Run: `npm test -- --runTestsByPath __tests__/screens/SettingsScreen.test.tsx`

Expected: PASS.

---

### Task 4: Verify Integration

**Files:**
- All files changed by Tasks 1-3.

- [ ] **Step 1: Run focused tests**

Run: `npm test -- --runTestsByPath __tests__/storage/prefs.test.ts __tests__/screens/SettingsScreen.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Review git diff**

Run: `git diff -- src/storage/prefs.ts src/i18n/translations.ts src/context/LanguageContext.tsx App.tsx src/navigation/index.tsx src/screens/SettingsScreen.tsx __tests__/storage/prefs.test.ts __tests__/screens/SettingsScreen.test.tsx`

Expected: Diff only contains UI language persistence, provider, dictionary, Settings toggle, navigation label updates, and focused tests.

