# Native interrupted restore acceptance

B11.2-B2. Base f753efb. Product behavior already implemented; this package verifies the native UI/storage/startup boundary. No feature redesign.

1. Clone the existing synthetic iOS26 fixture; preserve the original. Record raw before-state read-only.
2. Run the real app from an isolated copy with a test-only entry. Capture its coherent version3 snapshot and stage two deliberate differences: one synthetic translation marker and speechRate0.85. Substitute only clipboard input transport; use the real Settings preview and Restore app state action. Do not claim real clipboard/file-picker transport acceptance from this harness.
3. Hold the actual AsyncStorage preference write after the durable journal and earlier deck/plan/mission keys. Inspect raw partial state plus journal read-only. Kill the native process, not just the React tree.
4. Cold launch with the same key failing on recovery. Verify the real StorageGate blocks providers behind bilingual Retry, preserves the journal and does not seed/reset partial state. Allow storage and press the actual app Retry. Verify journal replay completes all entries and clears the journal; exact queue/counters/events survive with only deliberate fixture differences.
5. Restore normal Expo entry, cold launch and verify UI plus durable data. Run appropriate existing restore/startup tests, format/static checks, review evidence, update checklist, merge/push and verify CI. Keep hardware/low-storage/file/share/platform gates explicit.

Ruling: Reuse the existing isolated QA app copy and dependencies, copying current source before serving it. Only the cloned QA simulator uses the armed fault controls; normal main entry remains unchanged. Record server restoration before finishing.
