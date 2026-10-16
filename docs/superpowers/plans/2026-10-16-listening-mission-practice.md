# Listening practice with honest assistance evidence

Continue B06.1/B06.2 using the existing durable mission player rather than introducing a second checkpoint system. Add a listening-choice node, a separate development-only three-phrase draft pack, validated bundled audio/transcript/source references, explicit play/replay/loop/stop and transcript reveal. Spanish is hidden until explicitly revealed or feedback is shown; English meanings are the choices in both UI languages. Generated pronunciation is labeled and is not authentic conversation or a human speaker sample.

A successful bundled playback request must be persisted before an answer is enabled. This establishes playback-started evidence, not proof of audibility, completed listening or learning. Never silently substitute device speech for an assessed bundled listening item. Stop/cancel, blur, background and node changes must not cause late playback or stale checkpoint writes. No automatic playback. A revealed transcript stays recorded through retries/resume; model-answer assistance remains a separate marker. Listening observations carry media/content identity, transcript assistance and the appropriate modality, with no raw response/transcript persisted and no SRS/daily grading. Existing text mission and old backups remain compatible.

The renderer uses only compiled draft packs. Schema validation rejects missing assets, mismatched audio/source cards, transcript/source mismatch and malformed branches. A valid draft pack is not editorial acceptance. Bundle three current generated clips (morning greeting, coffee, water), requiring no new recordings/network/provider accounts. Existing mission persistence, replay deduplication and backup machinery cover the extended state.

- [x] RED schema/engine/evidence/backup tests, then backward-compatible listening definitions/transitions.
- [x] RED require-bundled playback tests, then a strict assessed-audio path that never falls back silently.
- [x] RED player tests, then shared-player integration, bilingual controls, dev-gated navigation and exact draft review packet.
- [x] Full quality/content checks, one fresh whole-package review and regression fixes, available simulator checks.
- [ ] Precise master updates, merge/push and successful CI; continue next AI package.

Ruling: assess short generated pronunciation with English meaning choices now; authentic dialogue/new-speaker comprehension requires accepted human recordings later. This unblocks player and evidence engineering without inventing language or audio acceptance. Automatic speech preference work remains a separate bounded task.
