# very small worker that polls ai_jobs and processes any needed followups
import time, os, json
DATA_DIR = os.path.join("backend","data","ai_jobs")
os.makedirs(DATA_DIR, exist_ok=True)
while True:
    for fname in os.listdir(DATA_DIR):
        if fname.endswith(".json"):
            path = os.path.join(DATA_DIR, fname)
            try:
                with open(path,"r",encoding="utf-8") as f: data=json.load(f)
                # we can add publishing step: move to frontend assets or call sign API
                # for now just log
                print("JOB:", data.get("job_id"), "len:", len(data.get("output","")))
                os.rename(path, path+".done")
            except Exception as e:
                print("ERR", e)
    time.sleep(6)
