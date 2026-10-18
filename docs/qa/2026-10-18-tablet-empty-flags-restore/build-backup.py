"""Read the preflighted QA source; write a local import file, never app storage."""
import datetime
import hashlib
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2]))
from scripts.simulator_isolation import validate_container

source = next(r for r in json.loads((HERE / 'native-state-check.json').read_text()) if r['phase'] == 'before')
root = Path(source['capturePath'])
validate_container(source['device'], root, Path.home() / 'Library/Developer/CoreSimulator/Devices')
manifest = next(root.rglob('RCTAsyncLocalStorage_V1/manifest.json'))
stored = json.loads(manifest.read_text())
def read(key):
    raw = stored.get(key)
    if raw is None:
        path = manifest.parent / hashlib.md5(key.encode()).hexdigest()
        raw = path.read_text() if path.exists() else 'null'
    return json.loads(raw)
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
fields = dict(dailyPlan='SRS_DAILY_PLAN_V1', missions='SRS_MISSIONS_V1', prefs='SRS_PREFS_V1', daily='SRS_DAILY_PROGRESS_V1', streak='SRS_STUDY_STREAK_V1', seenWords='SRS_SEEN_WORDS_V1', quizHistory='SRS_QUIZ_HISTORY_V1', lastSession='SRS_LAST_STUDY_SESSION_V1', notificationPrefs='SRS_NOTIFICATION_PREFS_V1')
state = {name: read(key) for name, key in fields.items()}
assert all(value is not None for value in state.values()), 'Record intended null/default normalization before proceeding'
for name, key in fields.items():
    assert digest(state[name]) == source['keyHashes'][key]
decks = read('SRS_DECKS_V3')
history = read('SRS_LEARNING_EVENTS_V1')
assert digest(decks) == source['keyHashes']['SRS_DECKS_V3']
assert digest(history) == source['keyHashes']['SRS_LEARNING_EVENTS_V1']
backup = dict(kind='colombian-spanish-backup', version=3, exportedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), decks=decks, applicationState=state, learningEvents=history['events'])
raw = json.dumps(backup, ensure_ascii=False, separators=(',', ':'))
output = Path('/tmp/colombian-empty-flags-restore.json')
output.write_text(raw)
metadata = dict(sourceContainer=str(root), backupSHA256=hashlib.sha256(raw.encode()).hexdigest(), characters=len(raw), deckCount=len(decks), cardCount=sum(len(d['cards']) for d in decks), eventCount=len(history['events']), applicationStateFields=list(state), normalizedFields=[], sourceKeyHashes=source['keyHashes'])
(HERE / 'fixture.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(json.dumps({k: v for k, v in metadata.items() if k not in ['sourceKeyHashes', 'sourceContainer']}))
