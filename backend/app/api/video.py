import os
import time
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.dependencies import pipeline, qdrant

router = APIRouter(prefix="/video", tags=["Video Indexing"])

# Services are now imported from app.dependencies

@router.post("/index-video")
async def index_video(
    file: UploadFile = File(...),
    camera_id: str = Form(...),
    timestamp_offset: float = Form(0.0),
    cam_lat: Optional[float] = Form(None),
    cam_lon: Optional[float] = Form(None)
):
    # 1. Create a temporary directory and save the uploaded video
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    temp_dir = os.path.join(base_dir, "data", "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Generate a unique filename to avoid collisions
    temp_file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    start_time = time.time()
    
    try:
        # Save the uploaded file chunk by chunk
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Process the video through the YOLO + TorchReID pipeline
        result = pipeline.process_video(
            video_path=temp_file_path, 
            camera_id=camera_id, 
            timestamp_start=timestamp_offset
        )

        if isinstance(result, dict):
            tracklets = result.get("tracklets", [])
            total_frames = result.get("total_frames", 0)
            total_tracks = result.get("total_tracks", len(tracklets))
        else:
            tracklets = result
            total_frames = len(tracklets) * 5
            total_tracks = len(tracklets)
        
        # 3. Index every returned tracklet into Qdrant
        indexed_count = 0
        for tracklet in tracklets:
            tracklet_id = tracklet["tracklet_id"]
            vector = tracklet["vector"]
            
            # Prepare metadata payload for Qdrant (everything except the vector and the tracklet UUID)
            payload = {
                "camera_id": tracklet["camera_id"],
                "original_track_id": tracklet["original_track_id"],
                "best_crop_path": tracklet["best_crop_path"],
                "best_crop_sharpness": tracklet["best_crop_sharpness"],
                "timestamp": tracklet["timestamp"],
                "cam_lat": cam_lat if cam_lat is not None else 9.0105,
                "cam_lon": cam_lon if cam_lon is not None else 38.7612
            }
            
            # Upsert into Qdrant
            qdrant.upsert_tracklet(tracklet_id=tracklet_id, vector=vector, payload=payload)
            indexed_count += 1

        duration_seconds = round(time.time() - start_time, 2)
            
        return {
            "status": "success",
            "message": f"Successfully processed video from camera {camera_id}", 
            "camera_id": camera_id,
            "indexed_tracklets": indexed_count,
            "total_frames": total_frames,
            "total_tracks": total_tracks,
            "duration_seconds": duration_seconds,
            "timestamp_offset": timestamp_offset,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
        
    finally:
        # 4. Clean up the temporary video file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

