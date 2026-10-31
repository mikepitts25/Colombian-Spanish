import {
  createBillingClient,
  entitlementActive,
  validLibraryProduct,
  PRODUCT_ID,
} from '../../src/billing/service';

const product = {
  identifier: PRODUCT_ID,
  productCategory: 'NON_SUBSCRIPTION',
  productType: 'NON_CONSUMABLE',
  subscriptionPeriod: null,
  priceString: '19,99 €',
};
const info = (active: boolean) => ({
  entitlements: {
    active: active
      ? { full_library: { isActive: true, productIdentifier: PRODUCT_ID, expirationDate: null } }
      : {},
  },
});
it('accepts only the exact permanent library entitlement and non-consumable product', () => {
  expect(entitlementActive(info(true) as any)).toBe(true);
  expect(entitlementActive(info(false) as any)).toBe(false);
  expect(
    entitlementActive({
      entitlements: {
        active: {
          full_library: { isActive: true, productIdentifier: 'other', expirationDate: null },
        },
      },
    } as any),
  ).toBe(false);
  expect(validLibraryProduct(product as any)).toBe(true);
  expect(validLibraryProduct({ ...product, subscriptionPeriod: 'P1M' } as any)).toBe(false);
  expect(validLibraryProduct({ ...product, productType: 'CONSUMABLE' } as any)).toBe(false);
});
it('loads a localized store price and grants access only from returned customer info', async () => {
  const sdk = {
    getProducts: async () => [product],
    getCustomerInfo: async () => info(false),
    purchaseStoreProduct: async () => ({ customerInfo: info(true) }),
    restorePurchases: async () => info(false),
  };
  const client = createBillingClient(sdk as any);
  expect((await client.product())?.priceString).toBe('19,99 €');
  expect(await client.purchase(product as any)).toBe(true);
  expect(await client.restore()).toBe(false);
});
it('refuses a subscription or different product even when passed directly to purchase', async () => {
  const client = createBillingClient({
    purchaseStoreProduct: async () => {
      throw new Error('must not reach checkout');
    },
  } as any);
  await expect(client.purchase({ ...product, identifier: 'other' } as any)).rejects.toThrow(
    'Invalid library product',
  );
});

it('accepts Google one-time products with unknown Apple-specific product type', () => {
  expect(validLibraryProduct({ ...product, productType: 'UNKNOWN' } as any, 'android')).toBe(true);
  expect(validLibraryProduct({ ...product, productType: 'UNKNOWN' } as any, 'ios')).toBe(false);
});
