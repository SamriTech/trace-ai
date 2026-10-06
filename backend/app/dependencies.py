from app.services.pipeline import VideoReIDPipeline
from app.services.qdrant_service import QdrantService

# Singleton instances to prevent loading models multiple times 
# and to prevent Qdrant local disk lock collisions
pipeline = VideoReIDPipeline()
qdrant = QdrantService()
