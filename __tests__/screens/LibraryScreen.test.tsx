import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LibraryScreen from '../../src/screens/LibraryScreen';
import { PurchaseProvider } from '../../src/context/PurchaseContext';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { BillingClient, PRODUCT_ID } from '../../src/billing/service';

const mockBack = jest.fn();
let mockLanguage = 'en';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: mockLanguage,
    t: (key: any, values: any) =>
      require('../../src/i18n/translations').translate(mockLanguage, key, values),
  }),
}));
function Count() {
  const { decks, ready } = useDeckContext();
  return <Text testID="accessible-count">{ready ? decks.length : 'loading'}</Text>;
}
const product = {
  identifier: PRODUCT_ID,
  productCategory: 'NON_SUBSCRIPTION',
  productType: 'NON_CONSUMABLE',
  subscriptionPeriod: null,
  priceString: '19,99 €',
};
function billing(overrides: Partial<BillingClient> = {}): BillingClient {
  return {
    customer: async () => false,
    product: async () => product as any,
    purchase: async () => true,
    restore: async () => true,
    subscribe: () => () => {},
    ...overrides,
  };
}
function open(client: BillingClient | null) {
  return render(
    <PurchaseProvider client={client}>
      <DeckProvider>
        <LibraryScreen />
        <Count />
      </DeckProvider>
    </PurchaseProvider>,
  );
}
beforeEach(async () => {
  await AsyncStorage.clear();
  mockLanguage = 'en';
  mockBack.mockClear();
});
it('shows localized one-time checkout, a real sample and free learning; purchase opens all collections', async () => {
  const ui = open(billing());
  const buy = await ui.findByRole('button', { name: 'Unlock library · 19,99 €' });
  await waitFor(() => expect(ui.getByTestId('accessible-count').props.children).toBe(10));
  expect(ui.getByText('One-time purchase. No subscription.')).toBeTruthy();
  fireEvent.press(ui.getAllByRole('button', { name: /Preview collection:/ })[0]);
  expect(ui.getByText('Sample phrase')).toBeTruthy();
  fireEvent.press(buy);
  await ui.findByText('Your full library is unlocked.');
  expect(ui.getByTestId('accessible-count').props.children).toBe(47);
  expect(ui.queryByRole('button', { name: /Unlock library ·/ })).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: 'Continue learning' }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});
it('offers restore even when the store product cannot load', async () => {
  const ui = open(billing({ product: async () => null }));
  const restore = await ui.findByRole('button', { name: 'Restore purchases' });
  await act(async () => fireEvent.press(restore));
  await ui.findByText('Your full library is unlocked.');
  expect(ui.getByTestId('accessible-count').props.children).toBe(47);
});
it('never advertises a checkout price when billing is unconfigured', async () => {
  const ui = open(null);
  await ui.findByText(
    'Purchases are unavailable right now. Your free learning is still available.',
  );
  expect(ui.queryByText(/19.99/)).toBeNull();
  expect(ui.queryByRole('button', { name: /Unlock library ·/ })).toBeNull();
});
it('supports Spanish purchase, restore and continued free learning copy', async () => {
  mockLanguage = 'es';
  const ui = open(billing());
  await ui.findByRole('button', { name: 'Desbloquear biblioteca · 19,99 €' });
  expect(ui.getByRole('button', { name: 'Restaurar compras' })).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Seguir aprendiendo gratis' })).toBeTruthy();
});
