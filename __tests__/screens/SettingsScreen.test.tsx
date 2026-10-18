import React from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendLearningEvent,
  getLearningEvents,
  LearningEvent,
} from '../../src/storage/learningEvents';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';
import { pickBackupFile, shareBackupFile } from '../../src/services/backupFiles';
jest.mock('expo-application', () => ({
  __esModule: true,
  nativeApplicationVersion: '1.2.3',
  nativeBuildVersion: '99',
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'bare' },
  ExecutionEnvironment: { StoreClient: 'storeClient' },
}));
jest.mock('../../src/services/backupFiles', () => ({
  pickBackupFile: jest.fn(),
  shareBackupFile: jest.fn(),
  BackupFileError: class extends Error {},
}));
import { restoreBackup } from '../../src/storage/backupRestore';
jest.mock('../../src/storage/backupRestore', () => {
  const actual = jest.requireActual('../../src/storage/backupRestore');
  return { restoreBackup: jest.fn(actual.restoreBackup) };
});

const mockNavigate = jest.fn();
let mockFocusEpoch = 0;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback, mockFocusEpoch]);
  },
}));

jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ date: '2026-01-01', count: 5, target: 10 }),
  saveDecks: jest.fn().mockResolvedValue(undefined),
  loadDecks: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

const mockToggleLanguage = jest.fn();
let mockLanguage: 'es' | 'en' = 'es';

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

import { getDailyProgress, loadDecks } from '../../src/storage/storage';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

const mockGetDailyProgress = getDailyProgress as jest.Mock;
const mockLoadDecks = loadDecks as jest.Mock;
const mockSetStringAsync = Clipboard.setStringAsync as jest.Mock;
const mockGetStringAsync = Clipboard.getStringAsync as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockFocusEpoch = 0;
  mockLanguage = 'es';
  Object.assign(jest.requireMock('expo-application'), {
    nativeApplicationVersion: '1.2.3',
    nativeBuildVersion: '99',
  });
  jest.requireMock('expo-constants').default.executionEnvironment = 'bare';
  mockGetDailyProgress.mockResolvedValue({ date: '2026-01-01', count: 5, target: 10 });
  mockLoadDecks.mockResolvedValue([]);
  mockSetStringAsync.mockResolvedValue(undefined);
  mockGetStringAsync.mockResolvedValue('');
  (pickBackupFile as jest.Mock).mockResolvedValue(null);
  (shareBackupFile as jest.Mock).mockResolvedValue(undefined);
});

describe('SettingsScreen rendering', () => {
  it('renders the Spanish Settings title by default', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('⚙️  Ajustes')).toBeTruthy());
  });

  it('renders the current daily goal from storage', async () => {
    mockGetDailyProgress.mockResolvedValue({ date: '2026-01-01', count: 0, target: 15 });
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('15 tarjetas por día')).toBeTruthy());
  });

  it('renders the UI language row in Spanish by default', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Idioma de interfaz')).toBeTruthy());
    expect(getByText('Español')).toBeTruthy();
  });

  it('does not render profile identity or session controls', async () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('⚙️  Ajustes')).toBeTruthy());

    expect(queryByText('Mike Pitts')).toBeNull();
    expect(queryByText('mikepitts25@gmail.com')).toBeNull();
    expect(queryByText('Editar Perfil')).toBeNull();
    expect(queryByText('CUENTA')).toBeNull();
    expect(queryByText('Cerrar Sesión')).toBeNull();
  });

  it('groups language and backup controls as app preferences', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('APLICACIÓN')).toBeTruthy());

    expect(getByText('Idioma de interfaz')).toBeTruthy();
    expect(getByText('Exportar respaldo')).toBeTruthy();
    expect(getByText('Importar respaldo')).toBeTruthy();
  });

  it('renders all Settings UI labels in Spanish', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('⚙️  Ajustes')).toBeTruthy());

    [
      'APRENDIZAJE',
      'Meta Diaria',
      '10 tarjetas por día',
      'Nuevas Tarjetas',
      '10 por día',
      'Recordatorios',
      'Recordatorios de estudio por la mañana y por la noche',
      'Gestionar Decks',
      'Organiza y edita tus decks',
      'APLICACIÓN',
      'Idioma de interfaz',
      'Español',
      'Exportar respaldo',
      'Copia tus decks y resultados de práctica al portapapeles',
      'Importar respaldo',
      'Restaurar desde portapapeles',
      'SOBRE LA APP',
      '1.2.3 · compilación 99',
      'Versión',
    ].forEach((label) => expect(getByText(label)).toBeTruthy());
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
    await waitFor(() => expect(getByText('⚙️  Settings')).toBeTruthy());

    [
      'LEARNING',
      'Daily Goal',
      '10 cards per day',
      'New Cards',
      '10 per day',
      'Reminders',
      'Morning and evening study reminders',
      'Manage Decks',
      'Organize and edit your decks',
      'APP',
      'UI language',
      'English',
      'Export Backup',
      'Copy your decks and practice results to the clipboard',
      'Import Backup',
      'Restore from clipboard',
      'ABOUT THE APP',
      '1.2.3 · build 99',
      'Version',
    ].forEach((label) => expect(getByText(label)).toBeTruthy());
  });

  it('opens Manage Decks from the learning section below Reminders', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Gestionar Decks')).toBeTruthy());

    fireEvent.press(getByText('Gestionar Decks'));

    expect(mockNavigate).toHaveBeenCalledWith('ManageDecks');
  });
});

describe('SettingsScreen export backup', () => {
  it('calls Clipboard.setStringAsync when export backup is pressed', async () => {
    const decks = [{ id: 'd1', name: 'Test', cards: [] }];
    mockLoadDecks.mockResolvedValue(decks);

    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Exportar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Exportar respaldo'));
    });
    await waitFor(() => expect(mockSetStringAsync).toHaveBeenCalledTimes(1));
  });

  it('exported JSON contains kind: "colombian-spanish-backup"', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Exportar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Exportar respaldo'));
    });
    await waitFor(() => {
      const jsonStr = mockSetStringAsync.mock.calls[0]?.[0];
      const parsed = JSON.parse(jsonStr);
      expect(parsed.kind).toBe('colombian-spanish-backup');
    });
  });

  it('does not translate exported learning content when UI language is English', async () => {
    mockLanguage = 'en';
    const decks = [
      {
        id: 'd1',
        name: 'Jerga Colombiana',
        cards: [
          {
            id: 'c1',
            front: '¿Qué más pues?',
            back: "What's up?",
            example: '¿Qué más pues, parce? | What is up, buddy?',
          },
        ],
      },
    ];
    mockLoadDecks.mockResolvedValue(decks);

    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Export Backup'));
    await act(async () => {
      fireEvent.press(getByText('Export Backup'));
    });

    await waitFor(() => {
      const jsonStr = mockSetStringAsync.mock.calls[0]?.[0];
      expect(JSON.parse(jsonStr).decks).toEqual(decks);
    });
  });

  it('shows a localized success alert after copying backup', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Exportar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Exportar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Respaldo copiado', expect.any(String)),
    );
  });
});

describe('SettingsScreen import backup', () => {
  it('shows localized error alert when clipboard is empty', async () => {
    mockGetStringAsync.mockResolvedValue('');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Importar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Importar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Nada que importar', expect.any(String)),
    );
  });

  it('shows localized error alert when clipboard contains invalid JSON', async () => {
    mockGetStringAsync.mockResolvedValue('{{not valid json}}');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Importar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Importar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('JSON inválido', expect.any(String)),
    );
  });

  it('shows localized error alert when JSON has wrong kind field', async () => {
    mockGetStringAsync.mockResolvedValue(JSON.stringify({ kind: 'wrong-app', decks: [] }));
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Importar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Importar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('No es un respaldo', expect.any(String)),
    );
  });

  it('shows localized error alert when backup is missing decks array', async () => {
    mockGetStringAsync.mockResolvedValue(
      JSON.stringify({ kind: 'colombian-spanish-backup', version: 1 }),
    );
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Importar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Importar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Respaldo inválido', expect.any(String)),
    );
  });

  it('shows localized confirmation dialog for valid backup JSON', async () => {
    mockGetStringAsync.mockResolvedValue(
      JSON.stringify({
        kind: 'colombian-spanish-backup',
        version: 1,
        decks: [{ id: 'd1', name: 'Test', cards: [] }],
      }),
    );
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Importar respaldo'));
    await act(async () => {
      fireEvent.press(getByText('Importar respaldo'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        '¿Importar respaldo?',
        expect.any(String),
        expect.any(Array),
      ),
    );
  });

  it('uses English alert copy when language is English', async () => {
    mockLanguage = 'en';
    mockGetStringAsync.mockResolvedValue('');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import Backup'));
    await act(async () => {
      fireEvent.press(getByText('Import Backup'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Nothing to import', expect.any(String)),
    );
  });
});

const observation: LearningEvent = {
  schemaVersion: 1,
  id: 'attempt-1',
  sessionId: 'quiz-1',
  cardId: 'c1',
  deckId: 'd1',
  modality: 'recognition',
  outcome: 'correct',
  evidence: 'answer-checked',
  occurredAt: 1000,
  hintsUsed: 0,
  durationMs: 2000,
};

describe('learning-history backup compatibility', () => {
  it('includes recorded observations in the new backup format', async () => {
    await appendLearningEvent(observation);
    const screen = render(<SettingsScreen />);
    fireEvent.press(await screen.findByText('Exportar respaldo'));
    await waitFor(() => expect(mockSetStringAsync).toHaveBeenCalled());
    const payload = JSON.parse(mockSetStringAsync.mock.calls[0][0]);
    expect(payload.version).toBe(2);
    expect(payload.learningEvents).toEqual([observation]);
  });

  it('restores observations and still accepts a legacy backup without erasing newer evidence', async () => {
    const screen = render(<SettingsScreen />);
    await screen.findByText('Importar respaldo');
    for (const payload of [{ version: 2, learningEvents: [observation] }, { version: 1 }]) {
      mockAlert.mockClear();
      mockGetStringAsync.mockResolvedValue(
        JSON.stringify({ kind: 'colombian-spanish-backup', decks: [], ...payload }),
      );
      await act(async () => {
        fireEvent.press(screen.getByText('Importar respaldo'));
      });
      const confirm = mockAlert.mock.calls.find(([title]) => title === '¿Importar respaldo?');
      await act(async () => {
        await confirm[2].find((button: any) => button.style === 'destructive').onPress();
      });
    }
    expect(await getLearningEvents()).toEqual([observation]);
    expect(restoreBackup).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid history or an unsupported backup version before changing data', async () => {
    await appendLearningEvent(observation);
    const screen = render(<SettingsScreen />);
    await screen.findByText('Importar respaldo');
    for (const payload of [
      { version: 2, learningEvents: [{ id: 'broken' }] },
      { version: 2 },
      { version: 99 },
    ]) {
      mockGetStringAsync.mockResolvedValue(
        JSON.stringify({ kind: 'colombian-spanish-backup', decks: [], ...payload }),
      );
      await act(async () => {
        fireEvent.press(screen.getByText('Importar respaldo'));
      });
      expect(mockAlert).toHaveBeenLastCalledWith('Respaldo inválido', expect.any(String));
    }
    expect(restoreBackup).not.toHaveBeenCalled();
    expect(await getLearningEvents()).toEqual([observation]);
  });
});

const validBackupCard = {
  id: 'custom-card',
  front: 'parce',
  back: 'friend',
  createdAt: 0,
  due: 1000,
  reps: 0,
  interval: 0,
  ease: 2.5,
  favorite: true,
  flagged: false,
  tags: ['Paisa'],
  reviewStatus: 'needs_native',
};
const validBackupDeck = { id: 'custom-deck', name: 'Custom', cards: [validBackupCard] };

describe('backup input safety', () => {
  it.each([
    ['null deck', [null]],
    ['blank deck ID', [{ ...validBackupDeck, id: ' ' }]],
    ['missing deck name', [{ id: 'd', cards: [] }]],
    ['invalid cards', [{ ...validBackupDeck, cards: {} }]],
    ['duplicate deck IDs', [validBackupDeck, validBackupDeck]],
    ['duplicate card IDs across decks', [validBackupDeck, { ...validBackupDeck, id: 'another' }]],
    ['null card', [{ ...validBackupDeck, cards: [null] }]],
    ...Object.entries({
      front: null,
      back: 1,
      due: '1000',
      createdAt: -1,
      reps: 0.5,
      interval: -1,
      ease: 0,
      favorite: 'true',
      flagged: 1,
      tags: ['Paisa', null],
      regions: ['paisa', 'unknown'],
      reviewStatus: 'accepted',
      reviewedAt: -1,
      example: {},
      ipa: [],
      register: 'unknown',
      conjugation: { present: null },
    }).map(([field, value]): [string, unknown] => [
      field,
      [{ ...validBackupDeck, cards: [{ ...validBackupCard, [field]: value }] }],
    ]),
  ])('rejects %s before confirmation or writes', async (_label, decks) => {
    await appendLearningEvent(observation);
    mockGetStringAsync.mockResolvedValue(
      JSON.stringify({
        kind: 'colombian-spanish-backup',
        version: 2,
        decks,
        learningEvents: [],
      }),
    );
    const screen = render(<SettingsScreen />);
    await act(async () => fireEvent.press(await screen.findByText('Importar respaldo')));
    expect(mockAlert).toHaveBeenLastCalledWith('Respaldo inválido', expect.any(String));
    expect(restoreBackup).not.toHaveBeenCalled();
    expect(await getLearningEvents()).toEqual([observation]);
  });

  it('rejects oversized clipboard input before attempting JSON parsing', async () => {
    mockGetStringAsync.mockResolvedValue(' '.repeat(10_000_001) + '{');
    const screen = render(<SettingsScreen />);
    await act(async () => fireEvent.press(await screen.findByText('Importar respaldo')));
    expect(mockAlert).toHaveBeenLastCalledWith('Respaldo demasiado grande', expect.any(String));
    expect(restoreBackup).not.toHaveBeenCalled();
  });

  it('handles clipboard read failure without changing data', async () => {
    mockGetStringAsync.mockRejectedValueOnce(new Error('clipboard unavailable'));
    const screen = render(<SettingsScreen />);
    await act(async () => fireEvent.press(await screen.findByText('Importar respaldo')));
    expect(mockAlert).toHaveBeenLastCalledWith('Error de respaldo', expect.any(String));
    expect(restoreBackup).not.toHaveBeenCalled();
  });

  it.each([undefined, 1, 2])('preserves valid custom data from version %s', async (version) => {
    const deck = {
      ...validBackupDeck,
      description: 'My phrases',
      cards: [
        {
          ...validBackupCard,
          tags: ['Paisa', '', ' '],
          regions: ['general', 'rolo'],
          example: 'Hola, parce',
          ipa: 'paɾse',
          reviewedAt: 0,
          register: 'casual',
          conjugation: {
            present: { yo: 'soy', tu: 'eres', el: 'es', nosotros: 'somos', ellos: 'son' },
            past: { yo: 'fui', tu: 'fuiste', el: 'fue', nosotros: 'fuimos', ellos: 'fueron' },
            future: { yo: 'seré', tu: 'serás', el: 'será', nosotros: 'seremos', ellos: 'serán' },
          },
        },
      ],
    };
    mockGetStringAsync.mockResolvedValue(
      JSON.stringify({
        kind: 'colombian-spanish-backup',
        version,
        decks: [deck],
        ...(version === 2 ? { learningEvents: [observation] } : {}),
      }),
    );
    const screen = render(<SettingsScreen />);
    await act(async () => fireEvent.press(await screen.findByText('Importar respaldo')));
    const confirm = mockAlert.mock.calls.find(([title]) => title === '¿Importar respaldo?');
    expect(confirm).toBeDefined();
    await act(async () =>
      confirm[2].find((button: any) => button.style === 'destructive').onPress(),
    );
    expect(restoreBackup).toHaveBeenCalledWith([deck], version === 2 ? [observation] : undefined);
  });
});

it('accepts a full built-in library backup without changing its content', async () => {
  const { ALL_DECKS } = require('../../src/data/decks');
  mockGetStringAsync.mockResolvedValue(
    JSON.stringify({
      kind: 'colombian-spanish-backup',
      version: 2,
      decks: ALL_DECKS,
      learningEvents: [],
    }),
  );
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Importar respaldo')));
  const confirm = mockAlert.mock.calls.find(([title]) => title === '¿Importar respaldo?');
  expect(confirm).toBeDefined();
  await act(async () => confirm[2].find((button: any) => button.style === 'destructive').onPress());
  expect(restoreBackup).toHaveBeenCalledWith(ALL_DECKS, []);
});

it('previews a file backup in the app and exposes explicit merge and replace choices', async () => {
  (pickBackupFile as jest.Mock).mockResolvedValue(
    JSON.stringify({
      kind: 'colombian-spanish-backup',
      version: 2,
      exportedAt: '2026-10-15T12:00:00.000Z',
      decks: [validBackupDeck],
      learningEvents: [],
    }),
  );
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Importar archivo de respaldo')));
  expect(await screen.findByText('Vista previa del respaldo')).toBeTruthy();
  expect(screen.getByText(/Exportado: 2026-10-15/)).toBeTruthy();
  expect(screen.getByText('Reemplazar decks')).toBeTruthy();
  expect(restoreBackup).not.toHaveBeenCalled();
  await act(async () => fireEvent.press(screen.getByText('Añadir tarjetas nuevas')));
  expect(restoreBackup).toHaveBeenCalledWith([validBackupDeck], [], 'merge-new');
});
it('shares a dated file snapshot without overwriting clipboard contents', async () => {
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Guardar archivo de respaldo')));
  expect(shareBackupFile).toHaveBeenCalledWith(expect.any(String), 'Guardar archivo de respaldo');
  const payload = JSON.parse((shareBackupFile as jest.Mock).mock.calls[0][0]);
  expect(payload.exportedAt).toEqual(expect.any(String));
  expect(payload.version).toBe(3);
  expect(mockSetStringAsync).not.toHaveBeenCalled();
});

it('leaves data unchanged when file selection is cancelled', async () => {
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Importar archivo de respaldo')));
  expect(restoreBackup).not.toHaveBeenCalled();
  expect(mockAlert).not.toHaveBeenCalled();
});
it('rejects an invalid file before presenting restore choices', async () => {
  (pickBackupFile as jest.Mock).mockResolvedValue('{}');
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Importar archivo de respaldo')));
  expect(await screen.findByText(/Respaldo inválido/)).toBeTruthy();
  expect(restoreBackup).not.toHaveBeenCalled();
});

it('keeps preview controls guarded through font changes until restore finishes', async () => {
  (pickBackupFile as jest.Mock).mockResolvedValue(
    JSON.stringify({ kind: 'colombian-spanish-backup', version: 2, decks: [], learningEvents: [] }),
  );
  const screen = render(<SettingsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Importar archivo de respaldo')));
  let finish!: () => void;
  (restoreBackup as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.press(await screen.findByText('Añadir tarjetas nuevas'));
  const window = Dimensions.get('window');
  const screenMetrics = Dimensions.get('screen');
  try {
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByText('Vista previa del respaldo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  } finally {
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
  fireEvent.press(screen.getByText('Cancelar'));
  await act(async () => fireEvent.press(screen.getByText('Reemplazar decks')));
  expect(screen.getByText('Vista previa del respaldo')).toBeTruthy();
  expect(shareBackupFile).not.toHaveBeenCalled();
  await act(async () => finish());
  await waitFor(() => expect(screen.queryByText('Vista previa del respaldo')).toBeNull());
});

it.each(['file', 'clipboard'])(
  'previews full-state %s input and requires its explicit restore action',
  async (source) => {
    const applicationState = {
      prefs: { uiLanguage: 'en' },
      daily: null,
      streak: null,
      seenWords: null,
      quizHistory: null,
      lastSession: null,
      notificationPrefs: null,
    };
    const raw = JSON.stringify({
      kind: 'colombian-spanish-backup',
      version: 3,
      decks: [],
      learningEvents: [],
      applicationState,
    });
    (pickBackupFile as jest.Mock).mockResolvedValue(raw);
    mockGetStringAsync.mockResolvedValue(raw);
    const screen = render(<SettingsScreen />);
    await act(async () =>
      fireEvent.press(
        await screen.findByText(
          source === 'file' ? 'Importar archivo de respaldo' : 'Importar respaldo',
        ),
      ),
    );
    expect(await screen.findByText('Restaurar estado de la app')).toBeTruthy();
    expect(restoreBackup).not.toHaveBeenCalled();
    await act(async () => fireEvent.press(screen.getByText('Restaurar estado de la app')));
    expect(restoreBackup).toHaveBeenCalledWith([], [], 'replace-state', applicationState);
    expect(mockAlert).toHaveBeenCalledWith('Importado', expect.stringContaining('Reinicia'));
  },
);

it('shows the native application build instead of placeholder version or an inactive store action', async () => {
  const screen = render(<SettingsScreen />);
  expect(await screen.findByText('1.2.3 · compilación 99')).toBeTruthy();
  expect(screen.queryByText('v2.0.0 (build 42)')).toBeNull();
  expect(screen.queryByText('App Store')).toBeNull();
});
it('identifies Expo Go host metadata in English rather than claiming it is the app version', async () => {
  mockLanguage = 'en';
  Object.assign(jest.requireMock('expo-application'), {
    nativeApplicationVersion: '55.0.34',
    nativeBuildVersion: '123',
  });
  jest.requireMock('expo-constants').default.executionEnvironment = 'storeClient';
  const screen = render(<SettingsScreen />);
  expect(await screen.findByText('Expo Go host: 55.0.34 · build 123')).toBeTruthy();
});
it('shows unavailable when native build values are missing or blank', async () => {
  Object.assign(jest.requireMock('expo-application'), {
    nativeApplicationVersion: null,
    nativeBuildVersion: '  ',
  });
  const screen = render(<SettingsScreen />);
  expect(await screen.findByText('No disponible · compilación No disponible')).toBeTruthy();
});

test('refreshes saved goal and cap when returning to Settings and ignores stale focus reads', async () => {
  await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 10 }));
  mockGetDailyProgress.mockResolvedValue({ target: 5, count: 1 });
  const screen = render(<SettingsScreen />);
  await screen.findByText('5 tarjetas por día');
  await screen.findByText('10 por día');
  let resolveOld!: (value: { target: number }) => void;
  mockGetDailyProgress.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  mockFocusEpoch++;
  screen.rerender(<SettingsScreen />);
  await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 15 }));
  mockGetDailyProgress.mockResolvedValue({ target: 20 });
  mockFocusEpoch++;
  screen.rerender(<SettingsScreen />);
  await screen.findByText('20 tarjetas por día');
  await screen.findByText('15 por día');
  await act(async () => resolveOld({ target: 5 }));
  expect(screen.getByText('20 tarjetas por día')).toBeTruthy();
  expect(screen.getByText('15 por día')).toBeTruthy();
});

test('marks goal summaries unavailable on focus read failure and recovers on the next focus', async () => {
  const screen = render(<SettingsScreen />);
  await screen.findByText('10 tarjetas por día');
  mockGetDailyProgress.mockRejectedValueOnce(new Error('read failed'));
  mockFocusEpoch++;
  screen.rerender(<SettingsScreen />);
  await waitFor(() =>
    expect(screen.getAllByText('No disponible · abre para reintentar')).toHaveLength(2),
  );
  mockGetDailyProgress.mockResolvedValue({ target: 20 });
  mockFocusEpoch++;
  screen.rerender(<SettingsScreen />);
  await screen.findByText('20 tarjetas por día');
  expect(screen.queryByText('No disponible · abre para reintentar')).toBeNull();
});
