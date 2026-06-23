from fastapi import APIRouter, Query
from app.services.recommender import get_recommendations

router = APIRouter()


@router.get("/{product_id}")
async def recommend(product_id: str, n: int = Query(8, ge=1, le=20)):
    products = await get_recommendations(product_id, n=n)
    return {"recommendations": products}
