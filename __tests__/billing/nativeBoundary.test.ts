import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getBillingClient } from '../../src/billing/service';

jest.mock('react-native-purchases', () => {
  throw new Error('Native billing must not load on unsupported or unconfigured surfaces');
});
const originalPlatform = Platform.OS;
const originalEnvironment = Constants.executionEnvironment;
const originalIOSKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const originalAndroidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
afterEach(() => {
  Object.assign(Platform, { OS: originalPlatform });
  Object.assign(Constants, { executionEnvironment: originalEnvironment });
  if (originalIOSKey === undefined) delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  else process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = originalIOSKey;
  if (originalAndroidKey === undefined) delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  else process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = originalAndroidKey;
});
it.each(['ios', 'android', 'web'])(
  'does not initialize a native SDK without a matching public key on %s',
  (platform) => {
    Object.assign(Platform, { OS: platform });
    Object.assign(Constants, { executionEnvironment: ExecutionEnvironment.Standalone });
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    expect(getBillingClient()).toBeNull();
  },
);
it('does not run Expo Go preview purchases even with a configured public key', () => {
  Object.assign(Platform, { OS: 'ios' });
  Object.assign(Constants, { executionEnvironment: ExecutionEnvironment.StoreClient });
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'appl_example';
  expect(getBillingClient()).toBeNull();
});
it('does not initialize web purchases with native keys', () => {
  Object.assign(Platform, { OS: 'web' });
  Object.assign(Constants, { executionEnvironment: ExecutionEnvironment.Standalone });
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'appl_example';
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'goog_example';
  expect(getBillingClient()).toBeNull();
});
it('rejects a secret or mismatched platform key', () => {
  Object.assign(Platform, { OS: 'ios' });
  Object.assign(Constants, { executionEnvironment: ExecutionEnvironment.Standalone });
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'sk_not_a_public_sdk_key';
  expect(getBillingClient()).toBeNull();
});
