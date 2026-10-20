"""Only changes a disposable filler on the validated mounted QA store."""
from pathlib import Path
import datetime,errno,json,os,sys
p=Path(__file__).resolve().parent;d=json.loads((p/'store-active.json').read_text());target=Path(d['target']);label=sys.argv[1];reserve=int(sys.argv[2]);assert 0<=reserve<2*1024*1024
assert target.stat().st_dev!=target.parent.stat().st_dev
assert os.statvfs(target).f_blocks*os.statvfs(target).f_frsize==d['totalBytes']<40*1024*1024
filler=target/'qa-bounded-filler.bin';record={'device':d['device'],'target':str(target),'requestedReserve':reserve,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
with filler.open('wb',buffering=0) as f:
 try:
  while True:f.write(b'Q'*65536)
 except OSError as e:
  assert e.errno==errno.ENOSPC;record['errno']=e.errno
if reserve:
 free=os.statvfs(target).f_bavail*os.statvfs(target).f_frsize
 with filler.open('r+b',buffering=0) as f:f.truncate(filler.stat().st_size-max(0,reserve-free))
s=os.statvfs(target);record['availableBytes']=s.f_bavail*s.f_frsize;record['fillerBytes']=filler.stat().st_size;record['hostAvailableBytes']=os.statvfs(p).f_bavail*os.statvfs(p).f_frsize
(p/f'{label}-space.json').write_text(json.dumps(record,indent=2)+'\n');print(record)
