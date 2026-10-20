from pathlib import Path
import subprocess,sys,json,stat,time,datetime,os
sys.path.insert(0,'/Users/mike/AppIdeas/Colombian-Spanish')
from scripts.simulator_isolation import validate_container
p=Path(__file__).resolve().parent;u='D5502A06-4858-428C-901C-587B58280F64';r=Path(subprocess.check_output(['xcrun','simctl','get_app_container',u,'com.mikepitts.colombianspanish','data'],text=True).strip());validate_container(u,r,Path.home()/'Library/Developer/CoreSimulator/Devices');cache=r/'Library/Caches';assert cache.is_dir() and not cache.is_symlink();original=stat.S_IMODE(cache.stat().st_mode);assert cache.stat().st_uid==os.getuid();denied=original & ~0o222
record={'device':u,'container':str(r),'cache':str(cache),'originalMode':oct(original),'deniedMode':oct(denied),'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
try:
 cache.chmod(denied);record['appliedMode']=oct(stat.S_IMODE(cache.stat().st_mode));(p/'cache-denied.json').write_text(json.dumps(record,indent=2)+'\n');print('Cache write denied; guard active',flush=True)
 deadline=time.monotonic()+180
 while time.monotonic()<deadline and not (p/'restore-cache').exists():time.sleep(.2)
finally:
 cache.chmod(original);record['restoredMode']=oct(stat.S_IMODE(cache.stat().st_mode));record['restoredUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();(p/'cache-restored.json').write_text(json.dumps(record,indent=2)+'\n');print('Original mode restored',flush=True)
