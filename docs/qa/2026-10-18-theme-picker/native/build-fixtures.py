"""Read original QA stores; produce host-side files for supported UI import only."""
import datetime
import hashlib
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[3]))
from scripts.simulator_isolation import validate_container

rows = json.loads((HERE / 'native-state-check.json').read_text())
fields = dict(dailyPlan='SRS_DAILY_PLAN_V1', missions='SRS_MISSIONS_V1', prefs='SRS_PREFS_V1', daily='SRS_DAILY_PROGRESS_V1', streak='SRS_STUDY_STREAK_V1', seenWords='SRS_SEEN_WORDS_V1', quizHistory='SRS_QUIZ_HISTORY_V1', lastSession='SRS_LAST_STUDY_SESSION_V1', notificationPrefs='SRS_NOTIFICATION_PREFS_V1')
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
result = []
for kind in ['phone', 'tablet']:
    source = next(row for row in rows if row['phase'] == 'source-' + kind + '-before')
    root = Path(source['capturePath'])
    validate_container(source['device'], root, Path.home() / 'Library/Developer/CoreSimulator/Devices')
    manifest = next(root.rglob('RCTAsyncLocalStorage_V1/manifest.json'))
    stored = json.loads(manifest.read_text())
    def read(key):
        raw = stored.get(key)
        if raw is None:
            file = manifest.parent / hashlib.md5(key.encode()).hexdigest()
            raw = file.read_text() if file.exists() else 'null'
        return json.loads(raw)
    state = {name: read(key) for name, key in fields.items()}
    assert all(value is not None for value in state.values()), 'Do not silently normalize source records'
    decks, history = read('SRS_DECKS_V3'), read('SRS_LEARNING_EVENTS_V1')
    for key in source['keyHashes']:
        assert digest(read(key)) == source['keyHashes'][key]
    fixture = dict(kind='colombian-spanish-backup', version=3, exportedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), decks=decks, learningEvents=history['events'], applicationState=state)
    raw = json.dumps(fixture, ensure_ascii=False, separators=(',', ':'))
    filename = '/tmp/colombian-barrio-' + kind + '-original.json'
    Path(filename).write_text(raw)
    result.append(dict(surface=kind, file=filename, backupSHA256=hashlib.sha256(raw.encode()).hexdigest(), characters=len(raw), normalizedFields=[], sourceDevice=source['device'], sourceContainer=str(root), sourceKeyHashes=source['keyHashes'], deckCount=len(decks), cardCount=sum(len(d['cards']) for d in decks), eventCount=len(history['events'])))
(HERE / 'fixture-metadata.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS: two host-side full-state fixtures, all eleven source records exact; no app storage written.')
