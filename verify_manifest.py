from pathlib import Path
import hashlib,sys
r=Path(__file__).parent; bad=[]
for line in (r/'MANIFEST_SHA256.txt').read_text().splitlines():
 h,rel=line.split('  ',1); p=r/rel
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=h: bad.append(rel)
print('PASS' if not bad else 'FAIL: '+', '.join(bad));sys.exit(bool(bad))
