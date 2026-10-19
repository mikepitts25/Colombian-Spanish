"""Read-only two-second sampling around a real clock boundary. No app writes."""
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import hashlib
import json
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from scripts.simulator_isolation import validate_container

uuid = 'D5502A06-4858-428C-901C-587B58280F64'
root = Path(subprocess.check_output(['xcrun', 'simctl', 'get_app_container', uuid,
    'com.mikepitts.colombianspanish', 'data'], text=True).strip())
validate_container(uuid, root, Path.home() / 'Library/Developer/CoreSimulator/Devices')
manifest = next(root.rglob('RCTAsyncLocalStorage_V1/manifest.json'))
baseline = json.loads(Path(sys.argv[1]).read_text())[-1]
output = Path(sys.argv[2])
assert not output.exists(), 'Do not overwrite evidence'
rows = []
deadline = time.monotonic() + 360
while time.monotonic() < deadline:
    m = json.loads(manifest.read_text())
    def read(key):
        raw = m.get(key)
        if raw is None:
            file = manifest.parent / hashlib.md5(key.encode()).hexdigest()
            raw = file.read_text() if file.exists() else 'null'
        return json.loads(raw)
    def digest(value):
        return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    hashes = {key: digest(read(key)) for key in baseline['keyHashes']}
    now = datetime.now(timezone.utc)
    daily = read('SRS_DAILY_PROGRESS_V1')
    if not rows or hashes != rows[-1]['keyHashes']:
        row = {'utc': now.isoformat(), 'expectedAnchorageDay': now.astimezone(ZoneInfo('America/Anchorage')).date().isoformat(),
            'capturePath': str(root), 'device': uuid, 'daily': daily, 'keyHashes': hashes,
            'journal': read('SRS_WRITE_JOURNAL_V1')}
        rows.append(row)
        output.write_text(json.dumps(rows, indent=2) + '\n')
        print(json.dumps({'utc': row['utc'], 'daily': daily}), flush=True)
    if daily['date'] == '2026-10-19' and now >= datetime(2026, 10, 19, 8, tzinfo=timezone.utc):
        print('Observed real midnight daily transition.', flush=True)
        sys.exit(0)
    time.sleep(2)
raise SystemExit('No transition before bounded observation deadline; do not claim acceptance.')
