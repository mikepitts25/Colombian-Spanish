import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
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
import { Alert } from 'react-native/Libraries/Alert/Alert';

const mockGetDailyProgress = getDailyProgress as jest.Mock;
const mockLoadDecks = loadDecks as jest.Mock;
const mockSetStringAsync = Clipboard.setStringAsync as jest.Mock;
const mockGetStringAsync = Clipboard.getStringAsync as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockLanguage = 'es';
  mockGetDailyProgress.mockResolvedValue({ date: '2026-01-01', count: 5, target: 10 });
  mockLoadDecks.mockResolvedValue([]);
  mockSetStringAsync.mockResolvedValue(undefined);
  mockGetStringAsync.mockResolvedValue('');
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
      '20 por día',
      'Recordatorios',
      '8:00 AM todos los días',
      'Gestionar Decks',
      'Organiza y edita tus decks',
      'APLICACIÓN',
      'Idioma de interfaz',
      'Español',
      'Exportar respaldo',
      'Copia tus decks al portapapeles',
      'Importar respaldo',
      'Restaurar desde portapapeles',
      'SOBRE LA APP',
      'Calificar la App',
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
      '20 per day',
      'Reminders',
      '8:00 AM every day',
      'Manage Decks',
      'Organize and edit your decks',
      'APP',
      'UI language',
      'English',
      'Export Backup',
      'Copy your decks to the clipboard',
      'Import Backup',
      'Restore from clipboard',
      'ABOUT THE APP',
      'Rate the App',
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
    await waitFor(() => expect(mockAlert).toHaveBeenCalledWith('JSON inválido', expect.any(String)));
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
