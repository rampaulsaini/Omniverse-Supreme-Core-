# minimal adapter: supports "local" stub or "remote" (HuggingFace) modes.
import os, subprocess, json, requests, time

MODE = os.environ.get("AI_MODE","stub")  # stub | remote | local
HF_API = os.environ.get("HF_API","")     # optional

def generate_with_stub(prompt, max_tokens=200):
    # deterministic, inexpensive placeholder
    out = f"[OMNIVERSE-STUB GENERATED]\nPROMPT:\n{prompt}\n\n--END--"
    return out

def generate_with_hf(prompt, model="gpt2", max_length=200):
    if not HF_API:
        return generate_with_stub(prompt)
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {HF_API}"}
    data = {"inputs": prompt, "parameters":{"max_new_tokens": max_length}}
    r = requests.post(url, headers=headers, json=data, timeout=60)
    try:
        res = r.json()
        if isinstance(res, list):
            return res[0].get("generated_text","")
        if isinstance(res, dict) and "error" in res:
            return generate_with_stub(prompt)
        return str(res)
    except Exception:
        return generate_with_stub(prompt)

def generate(prompt, max_tokens=200):
    if MODE=="remote":
        return generate_with_hf(prompt, max_length=max_tokens)
    if MODE=="local":
        # placeholder for integration with llama.cpp or other local binary
        # keep safe: call external process only if configured
        script = os.environ.get("LOCAL_GEN_SCRIPT","")
        if script and os.path.exists(script):
            p = subprocess.Popen([script], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            out,err = p.communicate(prompt, timeout=120)
            return out or generate_with_stub(prompt)
        return generate_with_stub(prompt)
    return generate_with_stub(prompt)
  
