import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { completeOnboarding } from '../../src/storage/onboarding';
import { translate, TranslationKey } from '../../src/i18n/translations';
let mockLanguage: 'en' | 'es' = 'en';
const label = (key: TranslationKey) => translate(mockLanguage, key);

const mockReset = jest.fn();
const mockSetActiveDeckId = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ reset: mockReset }) }));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({
    decks: [{ id: 'deck-travel', name: 'Travel', cards: [] }],
    setActiveDeckId: mockSetActiveDeckId,
  }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any) => require('../../src/i18n/translations').translate(mockLanguage, key),
  }),
}));
jest.mock('../../src/storage/onboarding', () => ({ completeOnboarding: jest.fn() }));
const save = completeOnboarding as jest.Mock;
function setup() {
  const ui = render(<OnboardingScreen />);
  fireEvent.press(ui.getByText(label('onboarding.reason.travel')));
  fireEvent.press(ui.getByText(label('onboarding.next')));
  fireEvent.press(ui.getByText(label('onboarding.region.all')));
  fireEvent.press(ui.getByText(label('onboarding.next')));
  return ui;
}
beforeEach(() => {
  mockLanguage = 'en';
  jest.clearAllMocks();
  save.mockResolvedValue(undefined);
});
test.each(['en', 'es'] as const)(
  'stays on setup after save failure and retries the selected intent before navigation (%s)',
  async (language) => {
    mockLanguage = language;
    save.mockRejectedValueOnce(new Error('disk full'));
    const ui = setup();
    fireEvent.press(ui.getByText(label('onboarding.start')));
    await waitFor(() => expect(ui.getByText(label('onboarding.saveError'))).toBeTruthy());
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockSetActiveDeckId).not.toHaveBeenCalled();
    fireEvent.press(ui.getByText(label('practice.retrySave')));
    await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ reason: 'travel', region: 'all', target: 10 });
    expect(mockSetActiveDeckId).toHaveBeenCalledWith('deck-travel');
  },
);
test('blocks duplicate submission, goal changes and local back while the write is unresolved', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = setup();
  fireEvent.press(ui.getByText(label('onboarding.start')));
  fireEvent.press(ui.getByText(label('onboarding.start')));
  fireEvent.press(ui.getByText('Back'));
  fireEvent.press(ui.getByText('20'));
  expect(ui.getByText('How many cards a day?')).toBeTruthy();
  expect(ui.getByText('20')).toBeDisabled();
  expect(save).toHaveBeenCalledTimes(1);
  expect(mockReset).not.toHaveBeenCalled();
  await act(async () => {
    release();
  });
  expect(mockReset).toHaveBeenCalledTimes(1);
});
test('does not navigate after unmount while saving', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = setup();
  fireEvent.press(ui.getByText(label('onboarding.start')));
  ui.unmount();
  await act(async () => {
    release();
  });
  expect(mockReset).not.toHaveBeenCalled();
});
