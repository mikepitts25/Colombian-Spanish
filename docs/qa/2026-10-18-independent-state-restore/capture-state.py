import pathlib,json,hashlib,subprocess,sys
if len(sys.argv) > 3:
 import plistlib
 containers=pathlib.Path(sys.argv[3])
 matches=[path.parent for path in containers.glob('*/.com.apple.mobile_container_manager.metadata.plist') if plistlib.loads(path.read_bytes()).get('MCMMetadataIdentifier') == 'com.mikepitts.colombianspanish']
 assert len(matches)==1
 root=matches[0]
else:
 root=pathlib.Path(subprocess.check_output(['xcrun','simctl','get_app_container',sys.argv[2],'com.mikepitts.colombianspanish','data'],text=True).strip())
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[3]))
from scripts.simulator_isolation import validate_container
validate_container(sys.argv[2], root, pathlib.Path.home()/'Library/Developer/CoreSimulator/Devices')
p=next(root.rglob('RCTAsyncLocalStorage_V1/manifest.json'));m=json.loads(p.read_text())
def read(k):
 s=m.get(k)
 if s is None:
  f=p.parent/hashlib.md5(k.encode()).hexdigest();s=f.read_text() if f.exists() else 'null'
 return json.loads(s)
r={'capturePath':str(root), 'pathMatchesRequestedDevice':True, 'phase':sys.argv[1], 'device':sys.argv[2], 'plan':read('SRS_DAILY_PLAN_V1'), 'missions':read('SRS_MISSIONS_V1'), 'capturedAt':__import__('time').time(),'daily':read('SRS_DAILY_PROGRESS_V1'),'session':read('SRS_LAST_STUDY_SESSION_V1'),'quizHistory':read('SRS_QUIZ_HISTORY_V1'), 'events':(read('SRS_LEARNING_EVENTS_V1') or {'quizHistory':read('SRS_QUIZ_HISTORY_V1'), 'events':[]})['events'],'cardCount':sum(len(x['cards']) for x in read('SRS_DECKS_V3')), 'notificationPrefs':read('SRS_NOTIFICATION_PREFS_V1'), 'prefs':read('SRS_PREFS_V1'), 'streak':read('SRS_STUDY_STREAK_V1'), 'fixtureCards':[c for d in read('SRS_DECKS_V3') for c in d['cards'] if c['front']=='Hace mucho calor hoy'], 'deckHash':hashlib.sha256(json.dumps(read('SRS_DECKS_V3'),sort_keys=True).encode()).hexdigest()}
keys=['SRS_DECKS_V3','SRS_DAILY_PLAN_V1','SRS_MISSIONS_V1','SRS_PREFS_V1','SRS_DAILY_PROGRESS_V1','SRS_STUDY_STREAK_V1','SRS_SEEN_WORDS_V1','SRS_QUIZ_HISTORY_V1','SRS_LAST_STUDY_SESSION_V1','SRS_NOTIFICATION_PREFS_V1','SRS_LEARNING_EVENTS_V1']
def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
r['keyHashes']={k:digest(read(k)) for k in keys}
journal=read('SRS_WRITE_JOURNAL_V1')
r['journal']=None if journal is None else {'schemaVersion':journal['schemaVersion'],'entries':[{'key':k,'expectedHash':digest(json.loads(v)),'matchesStored':digest(json.loads(v))==digest(read(k))} for k,v in journal['entries']]}
decks=read('SRS_DECKS_V3')
r['restoreCard']=decks[0]['cards'][0]
r['flaggedCards']=[{'deckId':d['id'], 'cardId':c['id']} for d in decks for c in d['cards'] if c.get('flagged')]
r['deckCount']=len(decks)
without=json.loads(json.dumps(decks))
cleared=json.loads(json.dumps(decks))
for d in without:
 for c in d['cards']: c.pop('flagged',None)
for d in cleared:
 for c in d['cards']: c['flagged']=False
r['deckWithoutFlagsHash']=digest(without)
r['expectedClearedDeckHash']=digest(cleared)
r['deckVariants']={}
for variant in ['absent','false','true']:
 copy=json.loads(json.dumps(decks))
 for deck in copy:
  for card in deck['cards']:
   if card['id']=='weather-phrase-001':
    if variant=='absent': card.pop('favorite',None)
    else: card['favorite']=variant=='true'
 r['deckVariants'][variant]=digest(copy)
o=pathlib.Path(__file__).with_name('native-state-check.json');a=json.loads(o.read_text()) if o.exists() else [];a.append(r);o.write_text(json.dumps(a,indent=2)+'\n');print(json.dumps(r))
