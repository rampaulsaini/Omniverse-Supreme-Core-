#!/usr/bin/env python3
# .github/scripts/generate_knowledge.py
import json, os, datetime

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
data_path = os.path.join(repo_root, "backend", "data", "knowledge.json")
os.makedirs(os.path.dirname(data_path), exist_ok=True)

# Load existing
try:
    with open(data_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
except:
    docs = []

base_entries = [
    {"id":"auto_k_"+str(i), "title": f"Auto Entry {i}", "text": f"Auto-generated knowledge snippet #{i} — generated at {datetime.datetime.utcnow().isoformat()}"} 
    for i in range(1,21)
]

# Simple merge: keep existing + append autos if not duplicate
existing_texts = {d.get("text") for d in docs}
for e in base_entries:
    if e["text"] not in existing_texts:
        docs.append(e)

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=2)

print(f"Written {len(docs)} knowledge entries to {data_path}")
