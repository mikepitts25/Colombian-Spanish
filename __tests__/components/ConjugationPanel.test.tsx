import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
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
