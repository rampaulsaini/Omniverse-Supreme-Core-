from fastapi import APIRouter, Request, BackgroundTasks
from pydantic import BaseModel
from .model_adapter import generate
import uuid, os, json, time

router = APIRouter(prefix="/api/ai", tags=["ai"])

class GenReq(BaseModel):
    prompt: str
    max_tokens: int = 300
    mode: str = "sync"  # sync | async

@router.post("/generate")
def generate_endpoint(req: GenReq, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    if req.mode=="async":
        # enqueue background job
        background_tasks.add_task(_background_generate, job_id, req.prompt, req.max_tokens)
        return {"job_id": job_id, "status":"queued"}
    else:
        text = generate(req.prompt, max_tokens=req.max_tokens)
        return {"job_id": job_id, "output": text, "time": time.time()}

def _background_generate(job_id, prompt, max_tokens):
    out = generate(prompt, max_tokens=max_tokens)
    path = os.path.join("backend","data","ai_jobs")
    os.makedirs(path, exist_ok=True)
    with open(os.path.join(path,f"{job_id}.json"),"w",encoding="utf-8") as f:
        json.dump({"job_id":job_id,"prompt":prompt,"output":out,"ts":time.time()}, f, ensure_ascii=False)

