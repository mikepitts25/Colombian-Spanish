# iOS narrow-phone applied-practice keyboard

B05.3-B2b2-B2g, October20. Evidence-only follow-up on main `ced3ba2efdcaf6db8fff4eef6e0a3457ad032e70`; no product change or native rebuild. Existing SDK57 Debug binary (1.0.0/build1.0.0), current JavaScript served by the isolated worktree on Metro8099. Native UI actions and all nine unmodified screenshots use CUA.

## Accepted bounded cell

The iOS26 SE3 phone `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730` ran alone. Classic/System, OS Light, portrait, Spanish then English, native text size3 then11; VoiceOver and host Capture Keyboard off. The profile's “Barrio Phone QA” name is not the app theme. The app is portrait locked; no rotation was attempted or accepted.

| Native capture                                        | Observation                                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [01 Spanish default](01-spanish-default-keyboard.png) | Software-key entry of `Buenos dias`                                                                                 |
| [02 Spanish maximum Check](02-spanish-max-check.png)  | Live text-size change retained draft; coordinate input refocus exposed full input box and Check above open keyboard |
| [03 Spanish maximum Hint](03-spanish-max-hint.png)    | Accessibility-target scroll separately exposes complete Hint above keyboard                                         |
| [04 Spanish maximum End](04-spanish-max-end.png)      | Further accessibility-target scroll exposes complete End above keyboard                                             |
| [05 English default](05-english-default-keyboard.png) | Same revision0 run reopened; unsubmitted draft entered again with software keys                                     |
| [06 English maximum Check](06-english-max-check.png)  | Live size change retained draft, coordinate refocus exposes full input box and Check                                |
| [07 English maximum Hint](07-english-max-hint.png)    | Complete Hint after separate accessibility-target scroll                                                            |
| [08 English maximum End](08-english-max-end.png)      | Complete End after further accessibility-target scroll                                                              |
| [09 Restored cold Home](09-restored-cold-home.png)    | Spanish Classic Home after restore and actual cold launch PID16410, text3/Light restored                            |

At maximum size the single-line field scrolls its text horizontally. The full value `Buenos dias` is present in both native accessibility sidecars; this does not claim all characters are visually simultaneous. Hint and End were positioned separately, not all actions at once. No Check, Hint or End was activated. This is control visibility via accessibility scrolling, not touch-only scrolling, full assistive navigation, accent-popup, theme matrix, signed build or physical-device acceptance. Draft retention is accepted through the live size change only; Back/language change discarded the unsubmitted draft normally, and English text was entered anew.

## State and recovery

Seven read-only checkpoints bind eleven raw-string hashes in [state-summary.json](state-summary.json). Baseline has48 decks/1402 cards/10 learning events, daily count0/target5/new0, no journal, and the retained October17 plan in `applied`. Baseline missions have no runs. Start creates the plan-linked `mvcgu0hh-3-g3teof35o8k` run at revision0; this is the only Spanish storage change. It has no hint, assistance, model reveal, completion, review credit or accumulated timing. The English checkpoint changes only the preferences record: `uiLanguage` becomes English and Save serializes the previously implicit Classic/System defaults as `themeId: classic` and `appearanceMode: system`. The run remains exact. The before-restore checkpoint equals English.

Recovery used the normal clipboard Import/Restore flow and a v3 backup generated from this device's exact own baseline; no direct app-storage writes or fixture import prepared the checks. The first clipboard transfer reported Invalid JSON and left app storage unchanged. Explicitly focusing the TextEdit document body before Select All/Copy corrected transfer: its verified378310-byte document produced the normal48-deck/1402-card/10-observation preview, then Imported/restart. The full backup and raw library snapshots remain host-only at `/tmp/colombian-ios-phone-applied`; backup SHA256 `d1b5d340a20cc5fe967ab4c4167fb9849b48aeec9f520a514362475188aef9e5`. No claim is made about the initial clipboard contents.

All eleven raw records equal baseline immediately after restoration and after actual cold launch. The cold Home screenshot independently shows the recovered UI. The known unsigned notification entitlement diagnostic was dismissed; notification delivery is not fixed or accepted here.

Initial setup using `127.0.0.1:8099` returned No script URL despite healthy Metro. The documented `-RCT_jsLocation localhost:8099` loaded PID9220 normally; this setup route correction is not a diagnosed product defect.

## Verification and resources

`python3 docs/qa/2026-10-20-ios-phone-applied-keyboard/verify.py` validates intended hash deltas, exact final recovery, unchanged learning counters/queue, revision0 run semantics, draft sidecars, file digests and recorded cleanup. It passively checks recorded evidence; it does not prove UI provenance or regenerate native interactions. Full raw equality was also compared locally before publishing the hash summary.

The exclusive-runtime watch recorded589 samples from11:20:17.570574 to11:41:42.467037 UTC with zero observed collisions (sampling is not continuous proof). The phone was terminated/shut down, owned Metro stopped, watch stopped, and Device Hub/TextEdit quit. [Cleanup](cleanup.json) records no booted iOS/attached Android or owned QA UI/Metro/watch process. Android is paused by owner direction; PR78 remains unmerged. No Android work, rebuild or duplicate broad local suite was performed; required CI provides broad integration checks. Other iOS cells and all human/signed/physical gates remain separate.
