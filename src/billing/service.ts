import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { CustomerInfo, PurchasesStoreProduct } from 'react-native-purchases';

type PurchasesSDK = typeof import('react-native-purchases').default;
export const PRODUCT_ID = 'com.mikepitts.colombianspanish.library.v1';
export const ENTITLEMENT_ID = 'full_library';

export function entitlementActive(info: CustomerInfo): boolean {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  return (
    !!entitlement?.isActive &&
    entitlement.productIdentifier === PRODUCT_ID &&
    entitlement.expirationDate === null
  );
}
export function validLibraryProduct(
  product: PurchasesStoreProduct,
  platform: string = Platform.OS,
): boolean {
  return (
    product.identifier === PRODUCT_ID &&
    product.productCategory === 'NON_SUBSCRIPTION' &&
    (product.productType === 'NON_CONSUMABLE' ||
      (platform === 'android' && product.productType === 'UNKNOWN')) &&
    product.subscriptionPeriod === null
  );
}
export interface BillingClient {
  customer(): Promise<boolean>;
  product(): Promise<PurchasesStoreProduct | null>;
  purchase(product: PurchasesStoreProduct): Promise<boolean>;
  restore(): Promise<boolean>;
  subscribe(listener: (fullLibrary: boolean) => void): () => void;
}
export function createBillingClient(sdk: PurchasesSDK): BillingClient {
  return {
    customer: async () => entitlementActive(await sdk.getCustomerInfo()),
    product: async () => {
      const products = await sdk.getProducts(
        [PRODUCT_ID],
        'NON_SUBSCRIPTION' as Parameters<PurchasesSDK['getProducts']>[1],
      );
      return products.find((product) => validLibraryProduct(product)) ?? null;
    },
    purchase: async (product) => {
      if (!validLibraryProduct(product)) throw new Error('Invalid library product');
      return entitlementActive((await sdk.purchaseStoreProduct(product)).customerInfo);
    },
    restore: async () => entitlementActive(await sdk.restorePurchases()),
    subscribe: (listener) => {
      const onInfo = (info: CustomerInfo) => listener(entitlementActive(info));
      sdk.addCustomerInfoUpdateListener(onInfo);
      return () => {
        sdk.removeCustomerInfoUpdateListener(onInfo);
      };
    },
  };
}

let nativeClient: BillingClient | undefined;
/** Never load Expo Go's preview purchase implementation or initialize web billing. */
export function getBillingClient(): BillingClient | null {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  const key =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : Platform.OS === 'android'
        ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
        : undefined;
  const prefix = Platform.OS === 'ios' ? 'appl_' : 'goog_';
  if (!key?.startsWith(prefix)) return null;
  if (!nativeClient) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sdk = require('react-native-purchases').default as PurchasesSDK;
    sdk.configure({ apiKey: key });
    nativeClient = createBillingClient(sdk);
  }
  return nativeClient;
}
