# Study topic navigation

## Intent

Make choosing another topic visible from Home and from an active study session. Keep the suggested session one tap away and replace the ambiguous Back action with a clearly labeled destination.

## Approaches

- **Selected:** retain the immediate suggested-session action and add an explicit topic chooser on Home and Study. This preserves quick starts while making topic selection discoverable. Mike selected this recommendation.
- Always open the topic browser before studying. This makes choice unavoidable but adds a step to every suggested session.

## Behavior

- Home keeps its existing primary study action and adds **Choose a topic** directly below it. The chooser remains available when the primary action offers a daily plan or resume.
- Home's existing **Browse all decks** link becomes **Browse all topics** and explicitly opens the browser even if Study already has a session mounted.
- The study session replaces **Back** with **Home**, which navigates to Home. A separate **Change topic** action appears beside or below the full wrapping topic title.
- Both topic actions open the existing Study topic browser. The current topic is marked while browsing from a session.
- Opening the browser preserves the active session in memory. **Continue studying** returns to that exact session without rebuilding its queue, changing its region, or resetting its card position.
- Selecting a different topic starts that topic through the existing session-start path. Previously saved grades remain saved. Existing daily limits and daily-plan persistence continue to apply.
- Opening or switching topics respects existing grading and checkpoint guards. Errors must remain visible and actionable rather than being bypassed by navigation.
- Learner-facing topic navigation uses **topic/topics** consistently in English, with corresponding Spanish translations.

## Scope and implementation choices

Reuse the existing React Native screens, topic browser, theme, and session persistence. Do not add a new navigation library or change card scheduling. Preserve wrapping titles, accessible text sizing, and comfortably sized controls. The bottom Study tab retains its existing session behavior; explicit topic actions always request the browser.

## Verification

Cover Home chooser entry with a mounted session, session-to-browser-to-session preservation, direct topic switching, Home navigation, and blocked switching during an unfinished save. Run relevant screen/lifecycle tests, type checking, lint, and formatting checks. Native visual and interaction acceptance requires simulator or device evidence.
