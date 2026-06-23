import re
from app.database.connection import get_db

PRODUCT_TYPES = {
    "kurta": ["kurta", "kurti"],
    "saree": ["saree", "sari"],
    "shirt": ["shirt", "tshirt", "t-shirt"],
    "jeans": ["jeans", "denim"],
    "dress": ["dress", "frock", "gown"],
    "lehenga": ["lehenga", "lehnga"],
    "suit": ["suit", "salwar"],
    "jacket": ["jacket", "blazer"],
    "trouser": ["trouser", "pant", "pants"],
    "shorts": ["shorts"],
    "skirt": ["skirt"],
    "top": ["top", "blouse"],
}

COLORS = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "maroon", "navy", "beige", "gold",
]

GENDER_KEYWORDS = {
    "men": ["men", "male", "boy", "gents"],
    "women": ["women", "female", "girl", "ladies", "woman"],
    "kids": ["kids", "children", "child"],
}


def parse_intent(text: str) -> dict:
    text_lower = text.lower().strip()
    intent = {
        "action": "search",
        "product_type": None,
        "color": None,
        "gender": None,
        "min_price": None,
        "max_price": None,
        "query": text_lower,
    }

    for ptype, aliases in PRODUCT_TYPES.items():
        if any(alias in text_lower for alias in aliases):
            intent["product_type"] = ptype
            break

    for color in COLORS:
        if color in text_lower:
            intent["color"] = color
            break

    for gender, keywords in GENDER_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            intent["gender"] = gender
            break

    price_match = re.search(r'under\s+(\d+)', text_lower)
    if price_match:
        intent["max_price"] = int(price_match.group(1))

    price_range = re.search(r'(\d+)\s*(?:to|-)\s*(\d+)', text_lower)
    if price_range:
        intent["min_price"] = int(price_range.group(1))
        intent["max_price"] = int(price_range.group(2))

    if any(word in text_lower for word in ["add", "cart", "buy"]):
        intent["action"] = "add_to_cart"
    elif any(word in text_lower for word in ["show", "find", "search", "looking", "want", "need"]):
        intent["action"] = "search"

    return intent


async def search_products(intent: dict, limit: int = 20) -> list:
    db = get_db()
    if not db:
        return []

    query = {}

    if intent.get("product_type"):
        aliases = PRODUCT_TYPES.get(intent["product_type"], [intent["product_type"]])
        query["$or"] = [
            {"category": {"$regex": alias, "$options": "i"}} for alias in aliases
        ] + [
            {"subcategory": {"$regex": alias, "$options": "i"}} for alias in aliases
        ] + [
            {"name": {"$regex": alias, "$options": "i"}} for alias in aliases
        ]

    if intent.get("color"):
        color_regex = {"$regex": intent["color"], "$options": "i"}
        if "$or" in query:
            query = {"$and": [query, {"$or": [{"color": color_regex}, {"name": color_regex}]}]}
        else:
            query["$or"] = [{"color": color_regex}, {"name": color_regex}]

    if intent.get("gender"):
        gender_filter = {"gender": {"$regex": intent["gender"], "$options": "i"}}
        if "$and" in query:
            query["$and"].append(gender_filter)
        elif query:
            query = {"$and": [query, gender_filter]}
        else:
            query = gender_filter

    price_filter = {}
    if intent.get("min_price"):
        price_filter["$gte"] = intent["min_price"]
    if intent.get("max_price"):
        price_filter["$lte"] = intent["max_price"]
    if price_filter:
        if "$and" in query:
            query["$and"].append({"price": price_filter})
        elif query:
            query = {"$and": [query, {"price": price_filter}]}
        else:
            query = {"price": price_filter}

    if not query:
        query = {"$text": {"$search": intent.get("query", "")}}

    cursor = db.products.find(query).limit(limit)
    products = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        products.append(doc)

    if not products and intent.get("query"):
        words = intent["query"].split()
        if words:
            fallback = db.products.find(
                {"name": {"$regex": words[0], "$options": "i"}}
            ).limit(limit)
            async for doc in fallback:
                doc["_id"] = str(doc["_id"])
                products.append(doc)

    return products
