import Constants from 'expo-constants';
// App-wide build-time feature flags.

// Internal content-QA tooling (translation review queue, flagged-cards CSV
// export). Useful while editing deck content; must not ship to end users.
export const SHOW_REVIEW_TOOLS = typeof __DEV__ !== 'undefined' && __DEV__;

// Only the owner-authorized editorial TestFlight profile enables these drafts.
// This does not expose recording, translation review or other developer tools.
export const SHOW_CAFE_DRAFTS =
  SHOW_REVIEW_TOOLS || Constants.expoConfig?.extra?.cafeEditorialPreview === true;
