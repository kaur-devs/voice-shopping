from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from app.database.connection import get_db
from bson import ObjectId

router = APIRouter()


@router.get("")
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    gender: str = Query(None),
    color: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    search: str = Query(None),
):
    db = get_db()
    if db is None:
        return JSONResponse(status_code=503, content={"products": [], "total": 0, "page": 1, "pages": 0, "error": "Database unavailable"})
    query = {}

    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if gender:
        query["gender"] = {"$regex": gender, "$options": "i"}
    if color:
        query["$or"] = [
            {"color": {"$regex": color, "$options": "i"}},
            {"name": {"$regex": color, "$options": "i"}},
        ]

    price_filter = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    if price_filter:
        query["price"] = price_filter

    if search:
        search_filter = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]}
        if query:
            query = {"$and": [query, search_filter]}
        else:
            query = search_filter

    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    cursor = db.products.find(query).skip(skip).limit(limit)

    products = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        products.append(doc)

    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/categories")
async def get_categories():
    db = get_db()
    if db is None:
        return {"categories": []}
    categories = await db.products.distinct("category")
    return {"categories": [c for c in categories if c]}


@router.get("/{product_id}")
async def get_product(product_id: str):
    db = get_db()
    if db is None:
        return {"error": "Database unavailable"}
    try:
        doc = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        return {"error": "Invalid product ID"}

    if not doc:
        return {"error": "Product not found"}

    doc["_id"] = str(doc["_id"])
    return doc
