# .github/scripts/translate_placeholder.py
import os, json
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
src = os.path.join(repo_root, "backend", "data", "knowledge.json")
out_dir = os.path.join(repo_root, "frontend", "i18n")
os.makedirs(out_dir, exist_ok=True)
with open(src, "r", encoding="utf-8") as f:
    docs = json.load(f)
langs = ["hi","en","es","fr","bn","ar"]  # initial set
for lang in langs:
    outpath = os.path.join(out_dir, f"knowledge_{lang}.json")
    # placeholder: duplicate text with language tag
    out = [{"id":d["id"], "title": d["title"], "text": f"[{lang}] {d['text']}"} for d in docs]
    with open(outpath, "w", encoding="utf-8") as o:
        json.dump(out, o, ensure_ascii=False, indent=2)
print("I18N placeholders written for:", langs)

