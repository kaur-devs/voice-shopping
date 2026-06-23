from fastapi import APIRouter
from app.database.connection import get_db
from app.models.order import CartItem
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.get("/{session_id}")
async def get_cart(session_id: str):
    db = get_db()
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        return {"session_id": session_id, "items": [], "total": 0}

    enriched_items = []
    total = 0
    for item in cart.get("items", []):
        try:
            product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
            if product:
                product["_id"] = str(product["_id"])
                enriched_items.append({
                    "product": product,
                    "quantity": item["quantity"],
                    "size": item.get("size", ""),
                    "subtotal": product.get("price", 0) * item["quantity"],
                })
                total += product.get("price", 0) * item["quantity"]
        except Exception:
            continue

    return {"session_id": session_id, "items": enriched_items, "total": total}


@router.post("/{session_id}/add")
async def add_to_cart(session_id: str, item: CartItem):
    db = get_db()
    cart = await db.carts.find_one({"session_id": session_id})

    if not cart:
        await db.carts.insert_one({
            "session_id": session_id,
            "items": [item.model_dump()],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
    else:
        existing = next(
            (i for i in cart["items"] if i["product_id"] == item.product_id),
            None,
        )
        if existing:
            await db.carts.update_one(
                {"session_id": session_id, "items.product_id": item.product_id},
                {"$inc": {"items.$.quantity": item.quantity}, "$set": {"updated_at": datetime.utcnow()}},
            )
        else:
            await db.carts.update_one(
                {"session_id": session_id},
                {"$push": {"items": item.model_dump()}, "$set": {"updated_at": datetime.utcnow()}},
            )

    return {"message": "Item added to cart"}


@router.delete("/{session_id}/remove/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    db = get_db()
    await db.carts.update_one(
        {"session_id": session_id},
        {"$pull": {"items": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return {"message": "Item removed from cart"}


@router.delete("/{session_id}/clear")
async def clear_cart(session_id: str):
    db = get_db()
    await db.carts.delete_one({"session_id": session_id})
    return {"message": "Cart cleared"}
