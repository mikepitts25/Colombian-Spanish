import subprocess,time,json,pathlib,selectors,os,hashlib
p=pathlib.Path('/tmp/colombian-android-storage');a=['/Users/mike/Library/Android/sdk/platform-tools/adb','-s','emulator-5554']
rows=[]
for label,speed,delay in [('normal','full','none'),('edge-2000ms','edge','2000')]:
 for args in [('speed',speed),('delay',delay)]:subprocess.run(a+['emu','network',*args],capture_output=True,check=True)
 start=time.monotonic(); proc=subprocess.Popen(a+['shell','nc','-w','12','example.com','80'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 proc.stdin.write(b'GET / HTTP/1.0\r\nHost: example.com\r\nConnection: close\r\n\r\n');proc.stdin.flush()
 sel=selectors.DefaultSelector();sel.register(proc.stdout,selectors.EVENT_READ);buf=b'';first=None
 while time.monotonic()-start<15:
  ready=sel.select(timeout=.25)
  if ready:
   data=os.read(proc.stdout.fileno(),65536)
   if not data:break
   if first is None:first=round(time.monotonic()-start,3)
   buf+=data
  if proc.poll() is not None:break
 if proc.poll() is None:proc.terminate()
 proc.wait(timeout=3);sel.close()
 row={'label':label,'firstByteSeconds':first,'elapsedSeconds':round(time.monotonic()-start,3),'responseBytes':len(buf),'httpOk':b'200 OK' in buf,'sha256':hashlib.sha256(buf).hexdigest(),'stderr':proc.stderr.read().decode(),'status':subprocess.check_output(a+['emu','network','status'],text=True)};rows.append(row);print(row,flush=True)
(p/'remote-probe.json').write_text(json.dumps(rows,indent=2)+'\n')
