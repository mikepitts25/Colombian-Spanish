import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ date: '2026-01-01', count: 5, target: 10 }),
  setDailyTarget: jest.fn().mockImplementation(async (n: number) => ({
    date: '2026-01-01',
    count: 5,
    target: Math.max(1, Math.floor(n)),
  })),
  saveDecks: jest.fn().mockResolvedValue(undefined),
  loadDecks: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

import { getDailyProgress, setDailyTarget, saveDecks, loadDecks } from '../../src/storage/storage';
import * as Clipboard from 'expo-clipboard';

const mockGetDailyProgress = getDailyProgress as jest.Mock;
const mockSetDailyTarget = setDailyTarget as jest.Mock;
const mockSaveDecks = saveDecks as jest.Mock;
const mockLoadDecks = loadDecks as jest.Mock;
const mockSetStringAsync = Clipboard.setStringAsync as jest.Mock;
const mockGetStringAsync = Clipboard.getStringAsync as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDailyProgress.mockResolvedValue({ date: '2026-01-01', count: 5, target: 10 });
  mockSetDailyTarget.mockImplementation(async (n: number) => ({
    date: '2026-01-01',
    count: 5,
    target: Math.max(1, Math.floor(n)),
  }));
  mockLoadDecks.mockResolvedValue([]);
  mockSetStringAsync.mockResolvedValue(undefined);
  mockGetStringAsync.mockResolvedValue('');
});

// ── Rendering ──────────────────────────────────────────────────────────────────

describe('SettingsScreen rendering', () => {
  it('renders without crashing', async () => {
    const screen = render(<SettingsScreen />);
    await waitFor(() => expect(screen.getByText('Settings')).toBeTruthy());
  });

  it('renders the Settings title', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Settings')).toBeTruthy());
  });

  it('renders all four daily goal buttons [5, 10, 15, 25]', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('5')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
      expect(getByText('25')).toBeTruthy();
    });
  });

  it('shows the current target value from storage', async () => {
    mockGetDailyProgress.mockResolvedValue({ date: '2026-01-01', count: 0, target: 15 });
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Cards per day: 15')).toBeTruthy());
  });

  it('renders the Backup section', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Backup')).toBeTruthy());
  });

  it('renders the export button', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Copy backup JSON')).toBeTruthy());
  });

  it('renders the import button', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getByText('Import from clipboard')).toBeTruthy());
  });
});

// ── Daily goal ────────────────────────────────────────────────────────────────

describe('SettingsScreen daily goal', () => {
  it('calls setDailyTarget(5) when "5" button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('5'));
    await act(async () => {
      fireEvent.press(getByText('5'));
    });
    expect(mockSetDailyTarget).toHaveBeenCalledWith(5);
  });

  it('calls setDailyTarget(25) when "25" button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('25'));
    await act(async () => {
      fireEvent.press(getByText('25'));
    });
    expect(mockSetDailyTarget).toHaveBeenCalledWith(25);
  });

  it('updates the displayed target after pressing a goal button', async () => {
    mockSetDailyTarget.mockResolvedValueOnce({ date: '2026-01-01', count: 5, target: 15 });
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('15'));
    await act(async () => {
      fireEvent.press(getByText('15'));
    });
    await waitFor(() => expect(getByText('Cards per day: 15')).toBeTruthy());
  });
});

// ── Export backup ──────────────────────────────────────────────────────────────

describe('SettingsScreen export backup', () => {
  it('calls Clipboard.setStringAsync when export button is pressed', async () => {
    const DECKS = [{ id: 'd1', name: 'Test', cards: [] }];
    mockLoadDecks.mockResolvedValue(DECKS);

    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Copy backup JSON'));
    await act(async () => {
      fireEvent.press(getByText('Copy backup JSON'));
    });
    await waitFor(() => expect(mockSetStringAsync).toHaveBeenCalledTimes(1));
  });

  it('exported JSON contains kind: "colombian-spanish-backup"', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Copy backup JSON'));
    await act(async () => {
      fireEvent.press(getByText('Copy backup JSON'));
    });
    await waitFor(() => {
      const jsonStr = mockSetStringAsync.mock.calls[0]?.[0];
      expect(jsonStr).toBeDefined();
      const parsed = JSON.parse(jsonStr);
      expect(parsed.kind).toBe('colombian-spanish-backup');
    });
  });

  it('exported JSON contains a decks array', async () => {
    const DECKS = [{ id: 'd1', name: 'Test', cards: [] }];
    mockLoadDecks.mockResolvedValue(DECKS);

    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Copy backup JSON'));
    await act(async () => {
      fireEvent.press(getByText('Copy backup JSON'));
    });
    await waitFor(() => {
      const jsonStr = mockSetStringAsync.mock.calls[0]?.[0];
      const parsed = JSON.parse(jsonStr);
      expect(Array.isArray(parsed.decks)).toBe(true);
      expect(parsed.decks[0].id).toBe('d1');
    });
  });

  it('shows a success alert after copying backup', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Copy backup JSON'));
    await act(async () => {
      fireEvent.press(getByText('Copy backup JSON'));
    });
    await waitFor(() => expect(mockAlert).toHaveBeenCalledWith('Backup copied', expect.any(String)));
  });
});

// ── Import backup ──────────────────────────────────────────────────────────────

describe('SettingsScreen import backup', () => {
  it('shows error alert when clipboard is empty', async () => {
    mockGetStringAsync.mockResolvedValue('');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import from clipboard'));
    await act(async () => {
      fireEvent.press(getByText('Import from clipboard'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Nothing to import', expect.any(String)),
    );
  });

  it('shows error alert when clipboard contains invalid JSON', async () => {
    mockGetStringAsync.mockResolvedValue('{{not valid json}}');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import from clipboard'));
    await act(async () => {
      fireEvent.press(getByText('Import from clipboard'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Invalid JSON', expect.any(String)),
    );
  });

  it('shows error alert when JSON has wrong kind field', async () => {
    const wrongKind = JSON.stringify({ kind: 'wrong-app', decks: [] });
    mockGetStringAsync.mockResolvedValue(wrongKind);
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import from clipboard'));
    await act(async () => {
      fireEvent.press(getByText('Import from clipboard'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Not a backup', expect.any(String)),
    );
  });

  it('shows error alert when backup is missing decks array', async () => {
    const noDecks = JSON.stringify({ kind: 'colombian-spanish-backup', version: 1 });
    mockGetStringAsync.mockResolvedValue(noDecks);
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import from clipboard'));
    await act(async () => {
      fireEvent.press(getByText('Import from clipboard'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Invalid backup', expect.any(String)),
    );
  });

  it('shows confirmation dialog for valid backup JSON', async () => {
    const validBackup = JSON.stringify({
      kind: 'colombian-spanish-backup',
      version: 1,
      decks: [{ id: 'd1', name: 'Test', cards: [] }],
    });
    mockGetStringAsync.mockResolvedValue(validBackup);
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => getByText('Import from clipboard'));
    await act(async () => {
      fireEvent.press(getByText('Import from clipboard'));
    });
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Import backup?',
        expect.any(String),
        expect.any(Array),
      ),
    );
  });
});
