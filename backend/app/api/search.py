import os
import cv2
import numpy as np
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.dependencies import pipeline, qdrant

router = APIRouter(prefix="/search", tags=["Search"])

# Initialize services
from app.services.kinematics import validate_trajectory

@router.post("/")
async def search_person(
    file: UploadFile = File(...),
    ref_lat: float = Form(...),
    ref_lon: float = Form(...),
    ref_timestamp: datetime = Form(...)
):
    # 1. Read and decode the uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file uploaded")

    # 2. Extract feature vector
    try:
        # Calls extract_single_image from pipeline
        feature_vector = pipeline.extract_single_image(image)
    except AttributeError:
        # Fallback if extract_single_image is not yet added to VideoReIDPipeline
        import torch
        features = pipeline.extractor([image])
        feature_vector = torch.nn.functional.normalize(features[0], p=2, dim=0).cpu().numpy().tolist()

    # 3. Query Qdrant for similar vectors
    search_results = qdrant.search_similar(feature_vector, limit=10, score_threshold=0.6)
    
    candidates = []
    ref_cam = {"lat": ref_lat, "lon": ref_lon}
    
    # 4. Validate trajectory for each match and construct response
    for result in search_results:
        payload = result.payload or {}
        
        # Extract match coordinates and timestamp
        cam_lat = payload.get("cam_lat", 0.0)
        cam_lon = payload.get("cam_lon", 0.0)
        match_cam = {"lat": cam_lat, "lon": cam_lon}
        
        match_time_str = payload.get("timestamp")
        match_timestamp = None
        if match_time_str:
            try:
                # Handle ISO format strings
                match_timestamp = datetime.fromisoformat(str(match_time_str).replace("Z", "+00:00"))
            except (ValueError, TypeError):
                match_timestamp = datetime.now()
        else:
            match_timestamp = datetime.now()

        # Order timestamps correctly for kinematics validation
        if ref_timestamp <= match_timestamp:
            is_feasible, vel, mode = validate_trajectory(ref_cam, ref_timestamp, match_cam, match_timestamp)
        else:
            is_feasible, vel, mode = validate_trajectory(match_cam, match_timestamp, ref_cam, ref_timestamp)
            
        crop_path = payload.get("best_crop_path", "")
        crop_filename = os.path.basename(crop_path) if crop_path else ""
            
        candidates.append({
            "tracklet_id": result.id,
            "confidence_score": round(result.score, 4),
            "camera_id": payload.get("camera_id"),
            "original_track_id": payload.get("original_track_id"),
            "lat": cam_lat,
            "lon": cam_lon,
            "sharpness_score": payload.get("best_crop_sharpness"),
            "timestamp": match_time_str,
            "crop_url": f"/api/crops/{crop_filename}" if crop_filename else None,
            "feasibility_badge": "Feasible" if is_feasible else "Unfeasible",
            "kinematics": {
                "velocity_kmh": round(vel, 2) if vel != float('inf') else -1,
                "transit_mode": mode
            }
        })
        
    return {"candidates": candidates}
