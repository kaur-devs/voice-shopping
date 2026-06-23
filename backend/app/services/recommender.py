import pickle
import os
from app.database.connection import get_db

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml/model/recommender.pkl")

_model_data = None


def _load_model():
    global _model_data
    if _model_data is None and os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model_data = pickle.load(f)
    return _model_data


async def get_recommendations(product_id: str, n: int = 8) -> list:
    model = _load_model()
    if not model:
        return await _fallback_recommendations(product_id, n)

    product_ids = model["product_ids"]
    similarity_matrix = model["similarity_matrix"]

    if product_id not in product_ids:
        return await _fallback_recommendations(product_id, n)

    idx = product_ids.index(product_id)
    sim_scores = list(enumerate(similarity_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:n + 1]

    recommended_ids = [product_ids[i] for i, _ in sim_scores]

    db = get_db()
    from bson import ObjectId
    products = []
    for rid in recommended_ids:
        try:
            doc = await db.products.find_one({"_id": ObjectId(rid)})
            if doc:
                doc["_id"] = str(doc["_id"])
                products.append(doc)
        except Exception:
            continue

    return products


async def _fallback_recommendations(product_id: str, n: int = 8) -> list:
    db = get_db()
    if not db:
        return []

    from bson import ObjectId
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        return []

    if not product:
        return []

    query = {"_id": {"$ne": product["_id"]}}
    if product.get("category"):
        query["category"] = product["category"]

    cursor = db.products.find(query).limit(n)
    products = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        products.append(doc)
    return products
