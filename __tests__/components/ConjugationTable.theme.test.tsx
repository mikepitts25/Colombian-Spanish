import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import ConjugationTable from '../../src/components/ConjugationTable';
import { renderWithTheme } from '../../testFixtures/renderWithTheme';
test('the legacy verb table repaints without resetting the selected tense', () => {
  const ui = renderWithTheme(<ConjugationTable />);
  fireEvent.press(ui.getByText('Futuro'));
  const form = ui.getByText('hablaré');
  expect(form).toHaveStyle({ color: '#333' });
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(form).toHaveStyle({ color: '#18352F' });
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'dark' });
  expect(form).toHaveStyle({ color: '#F7F3EA' });
});
