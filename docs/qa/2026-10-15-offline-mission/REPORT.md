# Offline draft mission — 15 October 2026

Environment: dedicated Colombian Spanish Fresh QA iPhone 16 Pro simulator, iOS 26.0, Expo Go 54.0.7, Metro development bundle on port 8098. Package: `codex/offline-mission-player`, based on main `4b28fc0`. This is not a signed release or physical-device result.

Observed through Device Hub UI:

- Opened development-only draft from Home; visible editorial and restricted-answer-set notice.
- Started the café scene and submitted `buenos dias`; accent feedback showed the accented model and explicit retry/assisted continuation.
- Terminated Expo Go and reopened the local bundle. Opening the mission returned to the exact accent feedback without another submission (image 01).
- Retried with `Buenos días`; correct feedback retained assistance history.
- Typed `Un café`, requested a hint, verified partial input remained, then submitted `Un café, por favor` successfully.
- Chose the unavailable-coffee response incorrectly, saw the repair explanation and continued explicitly with help.
- Completed the thank-you cloze with `gracias`. Completion said “Finished with hints, corrections or retries”; follow-up phrases were `buenos días` and `agua` (image 02).
- Switched app UI to Spanish and reopened the saved completion; title, notice, outcome, assistance and actions were localized (image 03).

Read-only inspection of this simulator's app storage confirmed one completed revision-12 run, five mission observations (four recall, one recognition), no raw typed answers, and exactly one ordinary pre-existing observation. The corrected greeting attempt had `assistance: model-answer`, zero authored hints and a correct outcome. The coffee observation had one hint. Daily state stayed count 1 / target 5 / newCount 1; the mission code does not grade cards. There was no duplicate accent attempt after cold restart.

Automated coverage includes no-hint completion, all authored reply branches, source references, graph/schema rejection, stale revisions, duplicate command identity, corrupt state, journal interruption recovery, event serialization, old/full-state backup compatibility, load/save errors, rapid actions, pending exit protection and settled-failure exit. Review findings were reproduced with failing tests and corrected: preserve partial input/time on hint; allow Back after a settled failed save.

Limits: the script remains an unreviewed development-only text draft. No listening, speaking, authentic human recording, learner effectiveness, Android/native accessibility service, physical keyboard/audio route or signed release-candidate result is claimed. Offline execution uses bundled text and local storage; network-disconnected Expo Go cold-loading was not tested. Full audio/media playback remains B06/B07.4 work.
