"""Disposable blank-store mount. App creates all overlay records through normal UI."""
from pathlib import Path
import datetime,hashlib,json,os,plistlib,subprocess,sys,time
sys.path.insert(0,'/Users/mike/AppIdeas/Colombian-Spanish')
from scripts.simulator_isolation import validate_container
p=Path(__file__).resolve().parent;u='D5502A06-4858-428C-901C-587B58280F64';bundle='com.mikepitts.colombianspanish'
r=Path(subprocess.check_output(['xcrun','simctl','get_app_container',u,bundle,'data'],text=True).strip());validate_container(u,r,Path.home()/'Library/Developer/CoreSimulator/Devices')
manifest=next(r.rglob('RCTAsyncLocalStorage_V1/manifest.json'));target=manifest.parent
assert target.relative_to(r).parts==('Library','Application Support',bundle,'RCTAsyncLocalStorage_V1')
assert not target.is_symlink() and target.stat().st_uid==os.getuid()
def inventory():return {str(f.relative_to(target)):hashlib.sha256(f.read_bytes()).hexdigest() for f in target.rglob('*') if f.is_file() and not f.is_symlink()}
app=Path(subprocess.check_output(['xcrun','simctl','get_app_container',u,bundle,'app'],text=True).strip());executable=app/plistlib.loads((app/'Info.plist').read_bytes())['CFBundleExecutable']
original=inventory();record={'device':u,'container':str(r),'target':str(target),'originalFiles':original,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'imageBytes':(p/'qa-store.dmg').stat().st_size};device=None
try:
 out=subprocess.check_output(['hdiutil','attach','-nobrowse','-noautoopen','-mountpoint',str(target),'-plist',str(p/'qa-store.dmg')]);entities=plistlib.loads(out)['system-entities'];device=next(x['dev-entry'] for x in entities if x.get('mount-point')==str(target));record['mountEntities']=entities
 assert target.stat().st_dev!=target.parent.stat().st_dev and not (target/'manifest.json').exists()
 record['mountedDevice']=device;record['totalBytes']=os.statvfs(target).f_blocks*os.statvfs(target).f_frsize
 assert record['totalBytes']<40*1024*1024
 (p/'store-active.json').write_text(json.dumps(record,indent=2)+'\n');print('Blank bounded store mounted; guard active; learner records not copied',flush=True)
 deadline=time.monotonic()+900
 while time.monotonic()<deadline and not (p/'restore-store').exists():time.sleep(.2)
finally:
 if device:
  stopped=subprocess.run(['xcrun','simctl','terminate',u,bundle],capture_output=True,text=True);record['terminateExit']=stopped.returncode;record['terminateOutput']=stopped.stdout+stopped.stderr
  # Do not expose original data to any running process with overlay state.
  ps=subprocess.check_output(['ps','-axo','command='],text=True);assert not any(x.strip().startswith(str(executable)) for x in ps.splitlines())
  out=subprocess.run(['hdiutil','detach',device],capture_output=True,text=True);record['detachExit']=out.returncode;record['detachOutput']=out.stdout+out.stderr;assert out.returncode==0
 record['restoredSameFilesystem']=target.stat().st_dev==target.parent.stat().st_dev;record['restoredFiles']=inventory();record['originalFilesPreserved']=record['originalFiles']==record['restoredFiles'];record['restoredUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();(p/'store-restored.json').write_text(json.dumps(record,indent=2)+'\n');print('Original store exposed only after app termination; preserved='+str(record['originalFilesPreserved']),flush=True)
