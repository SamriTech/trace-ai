import os
from qdrant_client import QdrantClient
from qdrant_client.http import models

class QdrantService:
    def __init__(self):
        # Since Docker isn't running, let's use Qdrant's local disk mode
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        storage_path = os.path.join(base_dir, "data", "qdrant_storage")
        os.makedirs(storage_path, exist_ok=True)
        
        self.client = QdrantClient(path=storage_path)
        self.collection_name = "tracklets"
        self._init_collection()

    def _init_collection(self):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=512,
                    distance=models.Distance.COSINE
                )
            )

    def upsert_tracklet(self, tracklet_id: str, vector: list[float], payload: dict = None):
        if payload is None:
            payload = {}
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=tracklet_id,
                    vector=vector,
                    payload=payload
                )
            ]
        )

    def search_similar(self, vector: list[float], limit: int = 5, score_threshold: float = 0.6):
        return self.client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
            score_threshold=score_threshold
        )
