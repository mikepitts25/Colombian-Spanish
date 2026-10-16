# Navigation 7 dependency and return-flow migration

B01.8-C1: migrate the coordinated native/bottom-tabs/native-stack/router packages to supported 7.x with existing Expo 54/RN 0.81/screens 4.16. Preserve the dynamic navigator and custom tab bar. Remove the Navigation 6 decoder path without forced transitive overrides or an unrelated Expo downgrade. The official upgrade guide documents changed `navigate` back/nested behavior and the replacement for `headerBackTitleVisible`.

- [x] Verify current peer/dependency requirements and a failing real-router regression for returning to Root without adding a duplicate root stack.
- [x] Upgrade coordinated packages, adopt explicit nested Root/Study navigation with pop semantics, migrate the header option and any required theme shape. Update affected behavioral tests.
- [x] Run complete tests, types/lint/format/data/content/export checks; compare audit paths and honest remaining counts. Export both platforms/project generation where practical or verify CI.
- [x] One fresh package review, fix reproduced findings, and native iPhone/tablet tab/stack/back/focus/mission/audio checks. Android license remains independently pending.
- [x] Record evidence/limits, merge/push and verify CI. Implementation `0c4b312`, CI run 38855643836 passed all quality/content and iOS/Android project-generation/JS-bundle jobs.

Official source: https://reactnavigation.org/docs/upgrading-from-6.x/ . Current native7.5.1 and stack/tabs7.21.0 metadata permits existing React/RN/screens/safe-area versions. Native build/signing and physical-device validation remain separate; no unverified removal of the wider SDK/Jest advisory trees is claimed.
