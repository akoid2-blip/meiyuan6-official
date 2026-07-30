#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
results=[]
def add(name, ok, detail=''):
    results.append({'name':name,'status':'PASS' if ok else 'FAIL','detail':detail})
def text(p): return p.read_text(encoding='utf-8',errors='replace')
# Required files
required=['index.html','assets/app.js','assets/style.css','assets/cloud-config.js','assets/auth-role-guard.js','assets/schema-v12-cloud-migration.js','assets/realtime-sync.js','assets/offline-conflict-guard.js','assets/supabase-singleton.js','assets/cloud-status-center.js','VERSION.json']
missing=[p for p in required if not (ROOT/p).is_file()]
add('Required files',not missing,', '.join(missing))
# JS syntax
bad=[]
for p in sorted((ROOT/'assets').glob('*.js')):
    cp=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if cp.returncode: bad.append(f'{p.name}: {cp.stderr.strip()}')
add('JavaScript syntax',not bad,'; '.join(bad))
# refs
html=text(ROOT/'index.html')
refs=re.findall(r'(?:src|href)=["\']([^"\']+)["\']',html)
missing_refs=[]
for r in refs:
    if r.startswith(('http:','https:','#','data:','mailto:','tel:','javascript:')): continue
    q=r.split('?')[0].split('#')[0]
    if q and not (ROOT/q).exists(): missing_refs.append(r)
add('HTML local references',not missing_refs,', '.join(missing_refs))
# Schema/version
v=json.loads(text(ROOT/'VERSION.json'))
add('Storage Schema v12',v.get('storageSchema')==12,str(v.get('storageSchema')))
# SQL migrations
migs=sorted((ROOT/'supabase/migrations').glob('*.sql'))
expected=[f'{i:03d}_' for i in range(1,8)]
add('SQL migration sequence',len(migs)>=7 and all(any(p.name.startswith(x) for p in migs) for x in expected),', '.join(p.name for p in migs))
# Security scan: actual assignments/URLs only, docs excluded
patterns=[r'eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}',r'postgres(?:ql)?://[^\s]+',r'(?i)(service[_ -]?role|secret[_ -]?key)\s*[:=]\s*["\'][^"\']{8,}']
hits=[]
for p in ROOT.rglob('*'):
    if not p.is_file() or p.suffix.lower() not in {'.js','.html','.json','.sql'}: continue
    s=text(p)
    for pat in patterns:
        if re.search(pat,s): hits.append(str(p.relative_to(ROOT)))
add('Sensitive secret scan',not hits,', '.join(sorted(set(hits))))
# Feature guards
checks={
'Authentication guard':'auth-role-guard.js' in html,
'Migration guard':'schema-v12-cloud-migration.js' in html,
'Offline conflict guard':'offline-conflict-guard.js' in html,
'Realtime layer':'realtime-sync.js' in html,
'Single Supabase Client':'supabase-singleton.js' in html and sum(text(p).count('createClient(') for p in (ROOT/'assets').glob('*.js')) == 1,
'Repository Factory':'RepositoryFactory' in text(ROOT/'assets/data-repository.js'),
'Cloud Status Center':'cloud-status-center.js' in html and 'Meiyuan6CloudStatus' in text(ROOT/'assets/cloud-status-center.js'),
'Effective mode derivation':'deriveMode' in text(ROOT/'assets/cloud-foundation.js'),
'Local-safe fallback':v.get('dataMode')=='local-safe-fallback',
'Cloud disabled by default':v.get('cloudModeEnabled') is False,
}
for k,val in checks.items(): add(k,bool(val))
# Responsive evidence
css=text(ROOT/'assets/style.css')
bands={'Mobile ≤650': r'@media\s*\([^)]*max-width\s*:\s*(?:4[0-9]{2}|5[0-9]{2}|650)px', 'Tablet 651–900': r'@media\s*\([^)]*max-width\s*:\s*(?:7[0-9]{2}|8[0-9]{2}|900)px', 'Desktop adaptation ≥901': r'@media\s*\([^)]*(?:min-width\s*:\s*901px|max-width\s*:\s*(?:9[1-9][0-9]|1[0-9]{3})px)' }
for label,pat in bands.items():
    add(f'Responsive coverage {label}',bool(re.search(pat,css)))
# Package paths
add('Index present', (ROOT/'index.html').is_file())
# Summary
failed=[r for r in results if r['status']=='FAIL']
report={'product':'Meiyuan6 Booking Admin','phase':'Enterprise V1.3 Phase 9 Stage 2 RC2 — Enterprise QA Level 2','results':results,'summary':{'pass':len(results)-len(failed),'fail':len(failed)}}
(ROOT/'qa/qa-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(1 if failed else 0)
