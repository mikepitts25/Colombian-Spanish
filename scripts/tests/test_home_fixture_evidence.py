"""Reject invalid recorded resume evidence without operating a simulator."""
import contextlib
import hashlib
import io
import json
from pathlib import Path
import runpy
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / 'docs/qa/2026-10-18-barrio-home-fixtures'
SNAPSHOTS = REPORT / 'native/native-state-check.json'
VERIFIER = REPORT / 'verify-evidence.py'


class HomeFixtureEvidenceTests(unittest.TestCase):
    def verify(self, mutate=None):
        original_read = Path.read_text
        rows = json.loads(SNAPSHOTS.read_text())
        resumed = next(r for r in rows if r['phase'] == 'phone-review-resumed')
        if mutate:
            mutate(resumed['session'])
            # Keep the checkpoint internally consistent; the verifier must compare
            # the complete intended session, not merely trust a recomputed digest.
            resumed['keyHashes']['SRS_LAST_STUDY_SESSION_V1'] = hashlib.sha256(
                json.dumps(resumed['session'], sort_keys=True, separators=(',', ':')).encode()
            ).hexdigest()
        def read(path, *args, **kwargs):
            return json.dumps(rows) if path == SNAPSHOTS else original_read(path, *args, **kwargs)
        with patch.object(Path, 'read_text', read), contextlib.redirect_stdout(io.StringIO()):
            runpy.run_path(str(VERIFIER), run_name='__main__')

    def test_accepts_recorded_exact_resume(self):
        self.verify()

    def test_allows_checkpoint_timestamp_refresh(self):
        self.verify(lambda s: s.update(updatedAt=s['updatedAt'] + 1000))

    def test_rejects_complete_session_divergence_despite_matching_hash(self):
        changes = {
            'deck': lambda s: s.update(deckId='another-deck'),
            'card_order': lambda s: s['queue'].update(cardIds=['catchup-6', 'catchup-5']),
            'extra_card': lambda s: s['queue']['cardIds'].append('catchup-7'),
            'card_limit': lambda s: s['queue']['limits'].update(cardLimit=99),
            'new_limit': lambda s: s['queue']['limits'].update(newLimit=99),
            'session_identity': lambda s: s['queue'].update(sessionId='replacement-session'),
            'region': lambda s: s['queue'].update(region='paisa'),
            'schema': lambda s: s['queue'].update(schemaVersion=99),
            'missing_queue': lambda s: s.pop('queue'),
            'unexpected_field': lambda s: s.update(unexpected='unverified'),
        }
        for name, mutate in changes.items():
            with self.subTest(name=name), self.assertRaises(AssertionError):
                self.verify(mutate)


if __name__ == '__main__':
    unittest.main()
