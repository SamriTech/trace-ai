import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.video import router as video_router
from app.api.search import router as search_router

app = FastAPI(title="Trace AI - Person Re-ID Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup path for crops directory
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
crops_dir = os.path.join(base_dir, "data", "crops")
os.makedirs(crops_dir, exist_ok=True)

# Mount static directory. We mount at /api/crops to match the URL pattern returned in search.py
app.mount("/api/crops", StaticFiles(directory=crops_dir), name="crops")

# Include routers
app.include_router(video_router, prefix="/api")
app.include_router(search_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Trace AI"}
