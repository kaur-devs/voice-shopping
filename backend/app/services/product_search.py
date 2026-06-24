import re
from app.database.connection import get_db

PRODUCT_TYPES = {
    "kurta": ["Kurtas"],
    "saree": ["Sarees"],
    "shirt": ["Shirts"],
    "tshirt": ["T-Shirts"],
    "jeans": ["Jeans"],
    "dress": ["Dresses"],
    "lehenga": ["Lehengas"],
    "suit": ["Suits"],
    "jacket": ["Jackets"],
    "trouser": ["Trousers"],
    "shorts": ["Shorts"],
    "skirt": ["Skirts"],
    "top": ["Tops"],
    "dupatta": ["Dupattas"],
    "footwear": ["Footwear"],
}

TYPE_ALIASES = {
    "kurti": "kurta", "kurtis": "kurta",
    "sari": "saree", "sarees": "saree",
    "shirts": "shirt",
    "t-shirt": "tshirt", "tee": "tshirt", "tshirts": "tshirt", "t-shirts": "tshirt",
    "denim": "jeans",
    "dresses": "dress", "frock": "dress", "gown": "dress",
    "lehengas": "lehenga", "lehnga": "lehenga",
    "salwar": "suit", "suits": "suit", "anarkali": "suit",
    "jackets": "jacket", "blazer": "jacket",
    "trousers": "trouser", "pant": "trouser", "pants": "trouser", "palazzo": "trouser",
    "skirts": "skirt",
    "blouse": "top", "tops": "top",
    "shoe": "footwear", "shoes": "footwear", "sneaker": "footwear",
    "sneakers": "footwear", "heels": "footwear", "sandals": "footwear",
    "dupattas": "dupatta", "stole": "dupatta",
}

COLORS = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "maroon", "navy", "beige", "gold",
]

GENDER_KEYWORDS = {
    "Men": ["men", "male", "boy", "gents"],
    "Women": ["women", "female", "girl", "ladies", "woman"],
    "Kids": ["kids", "children", "child"],
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

    for word in text_lower.split():
        if word in TYPE_ALIASES:
            intent["product_type"] = TYPE_ALIASES[word]
            break
        if word in PRODUCT_TYPES:
            intent["product_type"] = word
            break

    if not intent["product_type"]:
        for alias, ptype in TYPE_ALIASES.items():
            if alias in text_lower:
                intent["product_type"] = ptype
                break

    if not intent["product_type"]:
        for ptype in PRODUCT_TYPES:
            if ptype in text_lower:
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

    return intent


async def search_products(intent: dict, limit: int = 20) -> list:
    db = get_db()
    if db is None:
        return []

    product_type = intent.get("product_type")
    color = intent.get("color")
    gender = intent.get("gender")
    min_price = intent.get("min_price")
    max_price = intent.get("max_price")

    async def _query(filters, lim=limit):
        parts = [f for f in filters if f is not None]
        if not parts:
            return []
        q = {"$and": parts} if len(parts) > 1 else parts[0]
        results = []
        async for doc in db.products.find(q).limit(lim):
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    cat_filter = None
    if product_type:
        categories = PRODUCT_TYPES.get(product_type, [])
        if categories:
            cat_filter = {"category": {"$in": categories}}

    color_filter = None
    if color:
        cat_color = color.capitalize()
        color_filter = {"$or": [{"color": cat_color}, {"color": color}]}

    price_filter = None
    pf = {}
    if min_price:
        pf["$gte"] = min_price
    if max_price:
        pf["$lte"] = max_price
    if pf:
        price_filter = {"price": pf}

    gender_filter = None
    if gender:
        gender_filter = {"gender": gender}

    # Try full query: category + color + price + gender
    products = await _query([cat_filter, color_filter, price_filter, gender_filter])

    # Relax color (color data is often "Multi" or missing)
    if not products and cat_filter and color_filter:
        products = await _query([cat_filter, price_filter, gender_filter])

    # Relax gender
    if not products and cat_filter:
        products = await _query([cat_filter, price_filter])

    # No category match — try color only
    if not products and color_filter:
        products = await _query([color_filter, gender_filter, price_filter])

    # Last resort: text search
    if not products and intent.get("query"):
        words = intent["query"].split()
        keywords = [w for w in words if len(w) > 2 and w.lower() not in
                    ("show", "find", "need", "want", "the", "for", "can", "you",
                     "me", "some", "get", "all", "please")]
        if keywords:
            try:
                search_str = " ".join(keywords)
                async for doc in db.products.find({"$text": {"$search": search_str}}).limit(limit):
                    doc["_id"] = str(doc["_id"])
                    products.append(doc)
            except Exception:
                pass

    return products
