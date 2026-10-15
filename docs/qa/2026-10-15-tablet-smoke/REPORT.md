# Dedicated iPad smoke — 15 October 2026

Build/source: main `2da944e`, Expo Go 54.0.7, Expo SDK 54, local Metro development bundle at port 8098. Newly created dedicated **Colombian Spanish Tablet QA**, iPad Pro 13-inch (M4), iPadOS 26.0 (23A343), simulator ID `5EAE09E7-828A-4306-B727-E2BBB307C24C`. Unrelated tablets/simulators were not reset or modified. This is a supplementary simulator result, not a signed candidate or physical iPad acceptance.

Observed through Xcode Device Hub:

1. Fresh local launch, Expo intro dismissal, all three Spanish onboarding steps; selected Travel, Medellín/Paisa and five-card goal. Entered Travel study directly.
2. Card front/back interaction and named active-face controls; inactive face absent from the initial accessibility output. Portrait Study, regional controls, grade bar and selected tab were reachable (image 01). No flashcard grade submitted.
3. Opened the draft mission, started the café scene and typed `Buenos días`. The response field and Check/Hint controls remained visible above the iPad keyboard (image 02).
4. Submitted the answer, saw correct feedback, then rotated to landscape; feedback and continuation remained readable/reachable (image 03).
5. Terminated/reopened Expo Go, opened the mission from Home and visually verified the same greeting feedback returned. Read-only storage retained revision 2, correct answer index 0, one mission event and the Travel/Paisa/onboarded profile; no second submission was made on resume.
6. Returned to portrait, opened Settings, switched to English, opened Audio preferences and selected 1.25×. Preview returned **Source: generated clip** with Stop visible (image 04). Stop removed source status, and Save showed **Speed saved.**

After cold restart/rotation, Device Hub stopped exposing the app's React accessibility subtree, while screenshots and coordinate taps continued to work. Initial portrait interactions used AX indices; later checks used the latest screenshots and visible controls. This tooling limitation is not a VoiceOver result and does not establish or disprove device screen-reader behavior.

Layout observations: the tested controls did not overlap or disappear during these steps. Tablet Study leaves substantial vertical space, and mission/audio content stretches across a wide column; responsive visual refinement remains in B08.2-B/B08.4-B. This smoke is not full tablet support acceptance. Smaller iPads, multitasking/window resizing, large text, light theme, more long content, actual accessibility services, hardware audio and the signed candidate matrix remain open. No new product code changed in this evidence package.
