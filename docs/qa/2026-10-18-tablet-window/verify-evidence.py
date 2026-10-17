"""Verify recorded native snapshot invariants; does not control or mutate a simulator."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
rows = json.loads((root / "native-state-check.json").read_text())
assert len(rows) == 8
by_phase = {row["phase"]: row for row in rows}
assert len(by_phase) == len(rows)
baseline = by_phase["baseline"]
restored = by_phase["restored"]
assert baseline["device"] == restored["device"] == "A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F"
assert len(baseline["keyHashes"]) == 11
assert baseline["keyHashes"] == restored["keyHashes"]
assert len(restored["events"]) == 9
assert restored["daily"] == {"date": "2026-10-18", "count": 2, "target": 5, "newCount": 2}

mini = by_phase["mini-onboarded"]
assert mini["prefs"]["onboardingDone"] is True
assert mini["prefs"]["learningReason"] == "travel"
assert mini["prefs"]["homeRegion"] == "paisa"
assert mini["cardCount"] == 1392
assert mini["session"]["deckId"] == "deck-travel"
assert mini["session"]["cardId"] == "0038"
assert mini["session"]["queue"]["cardIds"] == [
    "0038", "0039", "0045", "0046", "0057", "0242", "0243", "0244", "0245", "0246"
]
for phase in ["mini-onboarded", "mini-main-es", "mini-english", "mini-landscape", "mini-restored", "mini-cold-resumed"]:
    row = by_phase[phase]
    assert row["device"] == "E66076BE-D9F8-49FB-870F-F29B57C4CA40"
    assert row["journal"] is None
    assert row["events"] == []
    assert row["plan"] is None and row["missions"] is None
    assert row["daily"] == {"date": "2026-10-18", "count": 0, "target": 5, "newCount": 0}
    changed = {key for key, value in row["keyHashes"].items() if value != mini["keyHashes"][key]}
    expected = ({"SRS_PREFS_V1"} if phase in ["mini-english", "mini-landscape"] else
                {"SRS_LAST_STUDY_SESSION_V1"} if phase == "mini-cold-resumed" else set())
    assert changed == expected, (phase, changed)
    prefs = {**mini["prefs"], "uiLanguage": "en" if phase in ["mini-english", "mini-landscape"] else "es"}
    assert row["prefs"] == prefs
    assert {k: v for k, v in row["session"].items() if k != "updatedAt"} == {
        k: v for k, v in mini["session"].items() if k != "updatedAt"
    }
assert by_phase["mini-cold-resumed"]["session"]["updatedAt"] > mini["session"]["updatedAt"]
for name in ["mini-onboarding-default.png", "mini-onboarding-live-selection-before.png",
             "mini-onboarding-live-selection-after.png", "mini-goals-largest.png",
             "mini-study-largest.png", "mini-home-largest-es.png", "mini-progress-largest-es.png",
             "mini-settings-largest-es.png", "mini-settings-default-en.png", "mini-home-default-en.png",
             "mini-study-flipped-default-en.png", "mini-study-landscape-default-en.png",
             "mini-study-cold-resumed-es.png"]:
    assert (root / name).is_file(), name
print("PASS: 8 snapshots, original 11-key preservation, mini intent/zero credit/exact queue, bounded language and resume writes; 13 screenshots present.")
