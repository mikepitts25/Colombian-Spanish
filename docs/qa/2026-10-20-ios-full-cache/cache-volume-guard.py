"""One-device bounded cache fault; restores mount in finally. Never touches learner DB."""
from pathlib import Path
import datetime,errno,hashlib,json,os,plistlib,subprocess,sys,time
sys.path.insert(0,'/Users/mike/AppIdeas/Colombian-Spanish')
from scripts.simulator_isolation import validate_container
p=Path(__file__).resolve().parent; u='D5502A06-4858-428C-901C-587B58280F64'
r=Path(subprocess.check_output(['xcrun','simctl','get_app_container',u,'com.mikepitts.colombianspanish','data'],text=True).strip());validate_container(u,r,Path.home()/'Library/Developer/CoreSimulator/Devices');cache=r/'Library/Caches'
assert cache.is_dir() and not cache.is_symlink() and cache.stat().st_uid==os.getuid()
def inventory():
 return {str(f.relative_to(cache)):hashlib.sha256(f.read_bytes()).hexdigest() for f in cache.rglob('*') if f.is_file() and not f.is_symlink()}
original=inventory();record={'device':u,'container':str(r),'cache':str(cache),'originalFiles':original,'imageBytes':(p/'qa-cache.dmg').stat().st_size,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()};device=None
try:
 attached=subprocess.run(['hdiutil','attach','-nobrowse','-noautoopen','-mountpoint',str(cache),'-plist',str(p/'qa-cache.dmg')],capture_output=True)
 (p/'attach-result.txt').write_text(attached.stderr.decode())
 if attached.returncode:raise RuntimeError('Cache-volume attach failed: '+attached.stderr.decode())
 info=plistlib.loads(attached.stdout);entities=info['system-entities'];mounted=next(x for x in entities if x.get('mount-point')==str(cache));device=mounted['dev-entry'];record['mountEntities']=entities
 assert cache.stat().st_dev!=cache.parent.stat().st_dev
 record['mountedDevice']=device; record['totalBytes']=os.statvfs(cache).f_blocks*os.statvfs(cache).f_frsize
 assert record['totalBytes']<40*1024*1024
 with (cache/'qa-bounded-filler.bin').open('wb', buffering=0) as f:
  block=b'Q'*65536
  try:
   while True:f.write(block)
  except OSError as e:
   assert e.errno==errno.ENOSPC
   record['fillerErrno']=e.errno
 record['freeBytes']=os.statvfs(cache).f_bavail*os.statvfs(cache).f_frsize
 record['hostFreeBytes']=os.statvfs(p).f_bavail*os.statvfs(p).f_frsize
 record['fillerBytes']=(cache/'qa-bounded-filler.bin').stat().st_size
 assert record['freeBytes']<32768 and record['hostFreeBytes']>1024**3
 (p/'fault-active.json').write_text(json.dumps(record,indent=2)+'\n');print('Bounded cache filesystem full; errno28 measured; guard active',flush=True)
 deadline=time.monotonic()+300
 while time.monotonic()<deadline and not (p/'restore-cache').exists():time.sleep(.2)
finally:
 if device:
  detached=subprocess.run(['hdiutil','detach',device],capture_output=True,text=True)
  record['detachExit']=detached.returncode;record['detachOutput']=detached.stdout+detached.stderr
  assert detached.returncode==0,record
 record['restoredSameFilesystem']=cache.stat().st_dev==cache.parent.stat().st_dev
 record['restoredFiles']=inventory();record['originalFilesPreserved']=all(record['restoredFiles'].get(k)==v for k,v in original.items())
 record['restoredUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (p/'fault-restored.json').write_text(json.dumps(record,indent=2)+'\n')
 print('Cache mount detached; original files preserved='+str(record['originalFilesPreserved']),flush=True)
