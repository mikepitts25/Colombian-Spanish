# Flagged Cards recovery and accessible layout

> Implement inline with superpowers:executing-plans; verify with TDD and a fresh whole-branch review.

Repair existing Flagged Cards actions under MASTER_PLAN B02.4-B2 and B08.2-B. Follow the existing management pattern: one synchronous pending ref, visible operation status, caught failures, no overlapping clipboard/clear actions or navigation while writing, and a new deliberate confirmation after uncertain clear failure. Do not automatically retry a destructive clear. Clipboard failure can be retried from the current displayed list; it never claims success until acknowledged. Retain screen owner state outside font-keyed native content.

- [x] Pin failed clipboard handling, one pending export, pending clear duplicate confirmations/control/navigation locks, and handled uncertain clear with fresh confirmation in failing screen regressions.
- [x] Implement guards/status/recovery using existing controls/tokens and bilingual copy. Put header/actions/hint in the scrolling list; use named 48-point wrapping controls, scale-safe row numbers and live font invalidation. Replace empty-state editorial-quality inference with factual no-flags copy.
- [x] Run focused/full/static/content checks; capture representative available native existing-list/layout/navigation evidence (native empty state remains open) without clearing existing flags. Any nonempty native fixture must be disposable and explicitly bounded.
- [ ] Fresh whole-branch review, checklist evidence, authorized merge/push and remote verification. Preserve human editorial acceptance and native keyboard/assistive/device gaps.
