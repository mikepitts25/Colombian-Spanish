// App-wide build-time feature flags.

// Internal content-QA tooling (translation review queue, flagged-cards CSV
// export). Useful while editing deck content; must not ship to end users.
export const SHOW_REVIEW_TOOLS = typeof __DEV__ !== 'undefined' && __DEV__;
