# Simulator fixture isolation preflight

Before launching or operating the app on any simulator, especially a clone, boot the intended device and run:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 scripts/simulator_isolation.py EXPLICIT-SIMULATOR-UUID
```

Proceed only after exit0 / `isolated: true`, then repeat after first launch. The tool performs only `simctl get_app_container … data` and path checks. It does not repair, launch, install, accept agreements, change permissions or write simulator data. It requires an explicit UUID and an installed app; exit1 on an unbooted/unavailable lookup means **unverified**, not proof of aliasing.

A successful result establishes that the reported absolute and resolved application data-container root belongs to the requested device at that observation. It does not prove all process/sandbox/framework behavior, app-group isolation, backup correctness or physical-device acceptance. Pair meaningful source preservation claims with read-only logical state hashes from the actual source directory, not another `get_app_container` lookup assumed to be independent.

On October18, `simctl clone` produced a tablet whose app lookup and runtime writes targeted its source device directory. Two older booted QA clones also returned foreign device directories. [Observed impact and recovery](2026-10-18-simulator-isolation/REPORT.md). Do not infer isolated app storage from a new simulator UUID, a successful clone command or a distinct UI window.

If the path is foreign: stop app interactions; record the requested UUID and actual path; do not uninstall/reset/delete either device because that could affect the source. Preserve the real source. Restore any bounded disposable-fixture changes through the app's supported import flow and verify all original state hashes through a real source cold launch. Do not directly edit app-storage files. Quarantine the alias and use a fresh `simctl create` plus installation of the existing authorized app binary. Check its container before and after launch before importing a QA fixture through app UI.

Known aliases as of this report (do not use for further app interactions):

| Requested UI device                  | Reported data device                 | State                                                             |
| ------------------------------------ | ------------------------------------ | ----------------------------------------------------------------- |
| AFCA5E93-0434-45B1-911C-E06B2B3A0BC8 | B51A3777-8E81-4049-B101-C2B18390E2B1 | Shutdown; renamed QUARANTINED - Mission Keyboard Alias            |
| A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F | B51A3777-8E81-4049-B101-C2B18390E2B1 | Shutdown; retain fixture and re-establish on a fresh installation |
| 6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1 | 5E9A8854-135A-4675-A437-4EFCA043F656 | Shutdown; retain fixture and re-establish on a fresh installation |

Additional positive aliases from the [nineteen-device audit](2026-10-18-simulator-claim-audit/REPORT.md), all returned to shutdown:

| Requested UI device                  | Reported data device                 |
| ------------------------------------ | ------------------------------------ |
| E66A88D6-CC87-4F46-A197-3F97EE9ED8CB | 5E9A8854-135A-4675-A437-4EFCA043F656 |
| C1E8FD8F-7542-4FF8-B36A-F6B4A4C620E0 | 5E9A8854-135A-4675-A437-4EFCA043F656 |
| 738E7A96-DCC0-459A-BDC3-EBAC4E6FBA04 | 5E9A8854-135A-4675-A437-4EFCA043F656 |

Fresh replacement DABA2821-3619-4F4A-B0C3-54E70B31511F has before/after-launch passing checks and a fresh onboarding UI. Smaller tablet E66076BE-D9F8-49FB-870F-F29B57C4CA40 passed the current path lookup. Recheck at the next use. Unbooted devices in the inventory remain unverified.

Historical screenshots and same-store state transitions remain observations of actual UI/storage behavior. Claims that two cloned devices supplied independent stores or that a shutdown source was protected require a separate audit or repeat on a fresh installation; do not promote those claims into stronger release acceptance. This finding does not change automated test outcomes or establish a product storage defect.

Run the eleven pure Python tests (no native runtime) with:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts/tests -p test_simulator_isolation.py
```

They cover own/foreign roots, child/shared paths, resolved cross-device aliases, malformed identities and CLI refusal/success. CI runs these scope tests; native simulator QA remains a separate workflow.
