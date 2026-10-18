import React from 'react';
import { StorageStatus } from '../../src/components/StorageGate';
import { renderWithTheme } from '../../testFixtures/renderWithTheme';
test('recovery action uses the theme primary ink, including light mode', () => {
  const ui = renderWithTheme(<StorageStatus error onRetry={() => {}} />);
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(ui.getByText('Reintentar / Try again')).toHaveStyle({ color: '#FFFFFF' });
  ui.applyTheme({ themeId: 'classic', appearanceMode: 'system' });
  expect(ui.getByText('Reintentar / Try again')).toHaveStyle({ color: '#020617' });
});
