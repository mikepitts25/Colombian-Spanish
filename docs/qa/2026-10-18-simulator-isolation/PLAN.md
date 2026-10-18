# Simulator container isolation and recovery

The initial task was remaining tablet keyboard-open touch positioning. Its attempted clone failed isolation; that keyboard acceptance remains open. The concrete package now addresses the discovered environment failure before further native app work:

1. Compare the requested device's reported/actual data path and direct source state. Stop UI writes when paths alias; distinguish lookup failure from positive alias evidence.
2. Restore the bounded ungraded source-fixture change using the app's version3 import/restore UI, then verify all eleven logical key hashes through a real source cold launch. No direct storage writes, uninstall, reset or device deletion.
3. Add read-only preflight checks and pure unit/CLI tests; integrate the tests in CI. Reject foreign/resolved/shared/child paths and ambiguous device selectors before reading or mutating a fixture.
4. Create a fresh simulator and install the existing authorized client. Verify its own container before/after launch, source preservation and actual fresh onboarding. Quarantine known aliases.
5. Update the master checklist and qualify historical clone-independence claims; obtain independent review and merge/push. Do not close keyboard, native OS, release, language or physical-device gates from this environment package.

Use CUA for UI, official simctl for infrastructure/screenshots/read-only lookup and recorded state for recovery proof. Skip the blocked security task.
