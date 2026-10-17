# Xcode generator UUID patch — 2026-10-17

## Change and rationale

B01.8-C2d: scope an exact-parent npm override to `xcode@3.0.1`, selecting `uuid11.1.1` instead of7.0.3. The [upstream advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq) identifies11.1.1 as patched; the [release](https://github.com/uuidjs/uuid/releases/tag/v11.1.1) is maintained in the CommonJS-compatible11.x family. This is a deliberate cross-major dependency override after API verification, not an upstream xcode release or a blanket dependency update.

The installed xcode consumer uses `require('uuid').v4()` to generate24-character uppercase project identifiers. Version11.1.1 retains that CommonJS entry/API. The advisory concerns v3/v5/v6 writes with supplied output buffers. No application input path to those APIs was identified here; this removes an affected build-tool dependency rather than proving an exploitable mobile-app flaw.

## Regression and compatibility evidence

The new test resolves UUID from the installed xcode package, outside Jest's React Native mocks. Before changing dependencies, v3/v5 each failed to reject short buffers, overflowing offsets and negative offsets without mutation. The existing v4 project-ID and valid v5 behavior check passed. After the scoped override and strict `npm ci`, all three tests passed. The valid v5 DNS result and bytes are independent literal expectations. The project generator produced1000 distinct24-character uppercase hexadecimal identifiers.

Full suite81/799 passed after installation, plus typecheck/lint/formatting. Existing asynchronous React act warnings remain. Expo iOS prebuild completed against the new graph. Its real generated PBX project parsed with33 distinct valid identifiers; writing/reparsing retained the identical identifier set and root. Project generation did not install Pods or compile a new native binary. Production Hermes exports passed for both iOS and Android.

Only UUID changed in the package lock. `npm ls uuid --all` shows the config-plugins→xcode3.0.1→uuid11.1.1 path. No Expo/RN/Navigation version, application code, scheduling data, microphone/release scope or external service configuration changed.

## Audits and remaining boundaries

| Snapshot      | Before                                  | After                                  |
| ------------- | --------------------------------------- | -------------------------------------- |
| Complete tree | 64 total:51 high,13 moderate,0 critical | 56 total:51 high,5 moderate,0 critical |
| Omit-dev tree | 41 total:28 high,13 moderate,0 critical | 33 total:28 high,5 moderate,0 critical |

Exact snapshots are adjacent. UUID and inherited xcode/config-plugin findings disappear; remaining roots are braces, node-forge and sprintf-js. Parent findings are inherited paths, not separate exploit counts. Omit-dev includes Expo build/test tooling and is not a description of the mobile runtime bundle. No security-clean or signed-release acceptance is claimed. B01.8-C2 stays open for the remaining maintained fixes/backports and their verification.

## Decisions and costs

- Select the patched CommonJS11.x release for the exact installed xcode parent. Cost: the override intentionally crosses xcode's declared UUID7 range; it must be re-evaluated when xcode changes.
- Verify real generator/bounds behavior and generated project compatibility. Cost: this tooling package does not add native-device or signing evidence.

Native live-timezone QA was attempted first, but Device Hub switched to DestinationPacker QA during inspection; the shared window was left alone. No simulator date/time settings were changed and B02.6-B2 remains open. The last verified Colombian Spanish app fixture remains default text size/Spanish,1392 cards, original eight-card Business queue, daily1/5 and6 retained QA events.

Fresh read-only review found no actionable critical/important/minor issues and independently reran all3 focused tests. Merged-main/CI evidence pending.
