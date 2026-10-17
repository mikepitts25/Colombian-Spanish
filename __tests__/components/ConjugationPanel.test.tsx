import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render, within } from '@testing-library/react-native';
import ConjugationPanel from '../../src/components/ConjugationPanel';

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return { useLanguage: () => ({ t: (key: any) => translate('en', key) }) };
});

it.each([false, true])('opens the actual conjugation dialog (compact=%s)', (compact) => {
  const screen = render(<ConjugationPanel infinitive="hablar" compact={compact} />);
  expect(screen.queryByText('hablar')).toBeNull();
  fireEvent.press(screen.getByText(/Conjugate/));
  expect(screen.getByText('hablar')).toBeTruthy();
  expect(within(screen.getByTestId('conjugation-row-tu')).getByText('hablas')).toBeTruthy();
  expect(within(screen.getByTestId('conjugation-row-vos')).getByText('hablás')).toBeTruthy();
});

it('does not teach a voseo form as tuteo when the tú form is missing', () => {
  const screen = render(<ConjugationPanel infinitive="reír" />);
  fireEvent.press(screen.getByText(/Conjugate/));
  expect(within(screen.getByTestId('conjugation-row-tu')).getByText('Not included')).toBeTruthy();
  expect(within(screen.getByTestId('conjugation-row-vos')).getByText('reís')).toBeTruthy();
  expect(screen.getByText('él / ella / usted')).toBeTruthy();
  expect(screen.getByText('ellos / ellas / ustedes')).toBeTruthy();
  fireEvent.press(screen.getByText('Future'));
  expect(within(screen.getByTestId('conjugation-row-tu')).getByText('reirás')).toBeTruthy();
});

it('retains the selected tense through live resizing and closes through a named control', () => {
  const window = Dimensions.get('window'),
    metrics = Dimensions.get('screen');
  const screen = render(<ConjugationPanel infinitive="hablar" />);
  try {
    fireEvent.press(screen.getByRole('button', { name: /Conjugate/ }));
    fireEvent.press(screen.getByRole('tab', { name: 'Future' }));
    act(() =>
      Dimensions.set({ window: { ...window, fontScale: 3 }, screen: { ...metrics, fontScale: 3 } }),
    );
    expect(screen.getByRole('tab', { name: 'Future', selected: true })).toBeTruthy();
    expect(within(screen.getByTestId('conjugation-row-tu')).getByText('hablarás')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('hablar')).toBeNull();
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: metrics }));
  }
});
