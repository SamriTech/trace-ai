import os
import cv2
import numpy as np
import torch
import uuid
from collections import defaultdict
from ultralytics import YOLO
import torchreid

class VideoReIDPipeline:
    def __init__(self, model_name='yolov8n.pt', extractor_model='osnet_x1_0', device=None):
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
            
        # Initialize YOLO for detection and tracking
        self.yolo = YOLO(model_name)
        
        # Initialize TorchReID feature extractor
        self.extractor = torchreid.utils.FeatureExtractor(
            model_name=extractor_model,
            device=self.device
        )
        
        # Make sure data/crops directory exists
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.crops_dir = os.path.join(base_dir, 'data', 'crops')
        os.makedirs(self.crops_dir, exist_ok=True)
        
    def _calculate_sharpness(self, image):
        """Calculate image sharpness using Laplacian variance."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def process_video(self, video_path: str, camera_id: str, timestamp_start: float = 0.0):
        """
        Process video to extract tracklets, track them, and compute ReID features.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video {video_path}")
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = 5
        frame_count = 0
        
        # Dictionary to group crops by track_id
        # track_id -> list of dicts: {'crop': np.ndarray, 'sharpness': float, 'frame_idx': int}
        tracklets_data = defaultdict(list)
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
                
            # Process every Nth frame (sample interval of 5 frames)
            if frame_count % frame_interval == 0:
                # Run YOLO tracking (ByteTrack) on 'person' class (0)
                results = self.yolo.track(frame, persist=True, classes=[0], tracker="bytetrack.yaml", verbose=False)
                
                if results and len(results) > 0 and results[0].boxes and results[0].boxes.id is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
                    track_ids = results[0].boxes.id.cpu().numpy().astype(int)
                    
                    for box, t_id in zip(boxes, track_ids):
                        x1, y1, x2, y2 = box
                        # Ensure coordinates are within frame bounds
                        h, w = frame.shape[:2]
                        x1, y1 = max(0, x1), max(0, y1)
                        x2, y2 = min(w, x2), min(h, y2)
                        
                        # Ignore very small crops
                        if x2 - x1 < 10 or y2 - y1 < 10:
                            continue 
                            
                        crop = frame[y1:y2, x1:x2].copy()
                        sharpness = self._calculate_sharpness(crop)
                        
                        tracklets_data[t_id].append({
                            'crop': crop,
                            'sharpness': sharpness,
                            'frame_idx': frame_count
                        })
            
            frame_count += 1
            
        cap.release()
        
        processed_tracklets = []
        
        for t_id, data_list in tracklets_data.items():
            if len(data_list) == 0:
                continue
                
            # Sort by sharpness in descending order
            data_list.sort(key=lambda x: x['sharpness'], reverse=True)
            
            # Select top 3 crops
            top_crops_data = data_list[:3]
            top_crops = [item['crop'] for item in top_crops_data]
            
            # Extract features for top crops using TorchReID
            # TorchReID feature extractor accepts a list of images as numpy arrays
            features = self.extractor(top_crops)
            
            # Compute mean feature vector
            mean_feature = torch.mean(features, dim=0)
            
            # Normalize the mean feature vector (L2 norm)
            mean_feature_norm = torch.nn.functional.normalize(mean_feature, p=2, dim=0)
            feature_vector = mean_feature_norm.cpu().numpy().tolist()
            
            # Save the best crop image (highest sharpness) to data/crops/
            best_crop = top_crops_data[0]
            tracklet_uuid = str(uuid.uuid4())
            crop_filename = f"{camera_id}_t{t_id}_{tracklet_uuid}.jpg"
            crop_path = os.path.join(self.crops_dir, crop_filename)
            cv2.imwrite(crop_path, best_crop['crop'])
            
            # Estimate timestamp for the best crop
            best_timestamp = timestamp_start + (best_crop['frame_idx'] / fps) if fps > 0 else timestamp_start
            
            processed_tracklets.append({
                'tracklet_id': tracklet_uuid,
                'camera_id': camera_id,
                'original_track_id': int(t_id),
                'vector': feature_vector,
                'best_crop_path': crop_path,
                'best_crop_sharpness': float(best_crop['sharpness']),
                'timestamp': best_timestamp
            })
            
        return {
            'tracklets': processed_tracklets,
            'total_frames': frame_count,
            'total_tracks': len(tracklets_data)
        }

    def extract_single_image(self, image: np.ndarray) -> list[float]:
        """Extract a normalized 512-dim Re-ID feature vector from a probe image."""
        features = self.extractor([image])
        feature_vector = torch.nn.functional.normalize(features[0], p=2, dim=0).cpu().numpy().tolist()
        return feature_vector

