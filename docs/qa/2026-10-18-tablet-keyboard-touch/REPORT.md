# Tablet keyboard touch follow-up and exact restoration

Base: `a9e1e1efa9fcb0c75f3ba5cb0eed605e59128e9a`. Normal development entry on localhost8098, owned fresh-installed iPad Pro13 M4 / iPadOS26, UUID `DABA2821-3619-4F4A-B0C3-54E70B31511F`. No app code, fault harness, simulator-storage writes or security work.

## Route and observations

The initial tablet had the prior completed October17 plan, 48 decks/1402 cards, 20 flags and11 learning events. The read-only collector and fixture builder saved an exact original v3 backup to `/tmp/colombian-keyboard-original.json`. A derived local backup changed only dailyPlan/missions to the previously recorded applied/no-run state. No normalization was needed. The app's supported full-state import and normal cold restart loaded that fixture after own-container preflights.

TextEdit copied each file, then Device Hub Edit → Send Clipboard transferred it to the named simulator. The initial clipboard import was empty before explicit transfer; it did not mutate state. The authorized native paste prompt was accepted. Import preview showed48 decks/1402 cards/11 observations. Restore state confirmed that restart was required. No file was written directly into app storage.

Home Continue → Start draft reply created the existing plan-linked run at revision0. With Capture Keyboard and VoiceOver off, software-key coordinate taps entered `Buenos` at Text Size3. [Default keyboard](default-keyboard.png) shows the draft and full Check/Hint/End controls above the keyboard. Live Text Size3→11 retained the draft but dismissed the keyboard during remeasurement. Tapping the enlarged input reopened it; [maximum keyboard open](maximum-keyboard-open.png) shows the draft immediately above the keyboard with Check out of view.

A new short prompt-origin drag `(1020,774) → (1020,724)` in the2120×1368 Device Hub window dismissed the keyboard without moving the form. [Dismissed state](maximum-keyboard-dismissed.png) shows Check/Hint/End at the same form position. This targeted short route was informed by the prior Study diagnostic; it did not establish keyboard-open touch positioning. No Check, Hint or End was pressed. Accent-popup attempts and unchanged wheel/AX routes were not repeated. These observations do not establish a product scrolling defect or a fix.

## Original state restored

Text Size3 was restored. Back returned to Home, Settings imported the exact original v3 backup, and normal terminate/launch recovered the original Home. All eleven logical record hashes match the baseline both immediately after restoration and after cold restart. The completed plan remains complete, its prior assisted mission remains intact, all11 events are unchanged, the ordinary queue/schedules/counters/preferences remain exact and no write journal remains. [Final Home](final-home.png) offers a new daily plan because the completed imported plan belongs to yesterday; no new plan was started.

Five own-path preflights and five read-only snapshots accompany this report. Known aliases stayed shut down; only the intended tablet was operated. The development client showed its existing expo-notifications keychain-entitlement warning after launch; it was dismissed. This is not a signed reminder or notification acceptance result.

## Verification and limits

Run `PYTHONDONTWRITEBYTECODE=1 python3 docs/qa/2026-10-18-tablet-keyboard-touch/verify-state.py`. The passive verifier checks recorded invariants and embedded hashes, not touch provenance or native layout. Simulator-isolation unit tests and repository formatting/whitespace checks were run. No runtime changes justify rerunning all app tests for this evidence-only batch; baseline a9e1e1e CI39110731761 and board39110731760 passed.

B05.3-B2b2-B2d closes the bounded original completed-state recovery/cold-preservation check. Parent B2 remains open for keyboard-open maximum-text touch positioning, accent popup, bilingual/rotation/smaller-tablet/window and assistive coverage. Do not repeat the failed short prompt drag without a changed input capability or targeted native diagnosis. Actual Android license/tooling, signed/physical, editorial and product/account gates remain separate; security B01.8-C2g stays skipped.
