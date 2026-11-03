"""Minimal, deployable FastAPI entry point for Omniverse Supreme Core.

This deliberately exposes only health and the existing AI adapter router.
The adapter defaults to a clearly labelled stub unless a provider is configured.
"""
from fastapi import FastAPI

app = FastAPI(title="Omniverse Supreme Core API", version="1.0.0")

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "omniverse-supreme-core"}

try:
    from ai_engine.api import router as ai_router
    app.include_router(ai_router)
except Exception as exc:  # Keep health endpoint available if optional AI wiring fails.
    app.state.ai_router_error = str(exc)
