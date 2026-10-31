"""Local retrieval with document identity, approval labels and retrieval evidence."""
from pathlib import Path
from datetime import date
import re
import uuid
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from core.config import PROJECT_ROOT
from core.database import connect
from core.stage3_db import audit

KNOWLEDGE_DIR = PROJECT_ROOT / 'knowledge'


def load_passages() -> list[dict]:
    passages=[]
    for path in sorted(KNOWLEDGE_DIR.rglob('*.md')):
        text=path.read_text(encoding='utf-8')
        identity=re.search(r'^Document ID:\s*(.+)$',text,re.M)
        simulated='SIMULATED' in text.upper() or 'DEMO' in path.name.upper()
        approved=bool(re.search(r'^Status:\s*APPROVED\s*$',text,re.M))
        status='SIMULATED — NOT AN APPROVED FACTORY SOP' if simulated else ('APPROVED' if approved else 'UNVERIFIED')
        review=re.search(r'^Review due:\s*(\d{4}-\d{2}-\d{2})',text,re.M)
        outdated=bool(review and date.fromisoformat(review.group(1)) < date.today())
        for index,paragraph in enumerate(text.split('\n\n'),1):
            if paragraph.strip():
                passages.append({'source':str(path.relative_to(KNOWLEDGE_DIR)),
                    'document_id':identity.group(1).strip() if identity else path.stem,
                    'section':index,'status':status,'outdated':outdated,
                    'review_date_missing':review is None,'text':paragraph.strip()})
    return passages


def search_knowledge(query: str, top_k: int = 3) -> list[dict]:
    passages=load_passages()
    if not passages or not query.strip(): return []
    vectorizer=TfidfVectorizer(ngram_range=(1,2),stop_words='english')
    try:
        matrix=vectorizer.fit_transform([p['text'] for p in passages]+[query])
    except ValueError:
        return []
    scores=cosine_similarity(matrix[-1],matrix[:-1])[0]
    results=[]
    for index in scores.argsort()[::-1]:
        if scores[index]<=0: continue
        item={**passages[int(index)],'score':round(float(scores[index]),4)}
        item['citation']=f"{item['document_id']}#section-{item['section']}"
        results.append(item)
        if len(results)>=min(max(top_k,1),10): break
    with connect() as con:
        if con.execute("SELECT 1 FROM sqlite_master WHERE name='operation_audit'").fetchone():
            audit(con,'KNOWLEDGE',uuid.uuid4().hex,'EVIDENCE_RETRIEVED','retrieval',
                  {'query':query,'citations':[r['citation'] for r in results],
                   'statuses':[r['status'] for r in results]})
    return results
