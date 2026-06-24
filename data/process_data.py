import os
import json
import random
import urllib.request

DATA_DIR = os.path.dirname(__file__)
OUTPUT_FILE = os.path.join(DATA_DIR, "processed_products.json")
RAW_FILE = os.path.join(DATA_DIR, "raw_scraped.json")

SHOPIFY_STORES = {
    "libas": "https://www.libas.in",
    "jaipurkurti": "https://www.jaipurkurti.com",
    "snitch": "https://www.snitch.co.in",
    "sassafras": "https://www.sassafras.in",
}

CATEGORY_KEYWORDS = {
    "Sarees": ["saree", "sari"],
    "Kurtas": ["kurta", "kurti"],
    "Lehengas": ["lehenga", "lehnga", "ghagra"],
    "Suits": ["suit", "salwar", "anarkali", "churidar"],
    "Dupattas": ["dupatta", "stole", "chunni"],
    "Dresses": ["dress", "gown", "frock", "maxi", "midi"],
    "Shirts": ["shirt"],
    "T-Shirts": ["t-shirt", "tshirt", "tee "],
    "Jeans": ["jean", "denim pant"],
    "Trousers": ["trouser", "pant", "palazzo", "jogger", "cargo pant"],
    "Jackets": ["jacket", "blazer", "shrug", "bomber"],
    "Shorts": ["short"],
    "Skirts": ["skirt"],
    "Tops": ["top", "blouse", "camisole", "tank"],
    "Footwear": ["shoe", "sneaker", "heel", "sandal", "loafer", "slipper"],
}

COLORS = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "maroon", "navy", "beige", "gold",
    "cream", "teal", "lavender", "peach", "coral", "mint", "olive", "rust",
    "wine", "magenta", "turquoise", "ivory", "indigo", "mustard", "charcoal",
]

GENDER_MAP = {
    "snitch": "Men",
    "libas": "Women",
    "jaipurkurti": "Women",
    "sassafras": "Women",
}


def scrape_stores():
    """Scrape products from Shopify stores."""
    all_data = {}
    for name, base_url in SHOPIFY_STORES.items():
        products = []
        page = 1
        while page <= 10:
            url = f"{base_url}/products.json?limit=250&page={page}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            try:
                resp = urllib.request.urlopen(req, timeout=15)
                batch = json.loads(resp.read()).get("products", [])
                if not batch:
                    break
                products.extend(batch)
                page += 1
            except Exception:
                break
        all_data[name] = products
        print(f"  Scraped {name}: {len(products)} products")

    with open(RAW_FILE, "w") as f:
        json.dump(all_data, f)
    return all_data


def detect_category(title, product_type):
    text = (title + " " + product_type).lower()
    if "t-shirt" in text or "tshirt" in text or "tee " in text:
        return "T-Shirts"
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return cat
    return None


def detect_color(title):
    title_lower = title.lower()
    for c in COLORS:
        if c in title_lower:
            return c.capitalize()
    return "Multi"


def process_scraped(raw_data):
    """Convert raw Shopify data to our product format."""
    all_products = []

    for store, products in raw_data.items():
        default_gender = GENDER_MAP.get(store, "Unisex")

        for p in products:
            title = (p.get("title") or "").strip()
            if not title:
                continue

            images = p.get("images", [])
            if not images:
                continue
            img_url = images[0].get("src", "")
            if not img_url:
                continue

            variants = p.get("variants", [])
            price = 0
            if variants:
                price = float(variants[0].get("price", "0") or "0")
            if price <= 0:
                continue

            product_type = (p.get("product_type") or "").strip()
            category = detect_category(title, product_type)
            if not category:
                continue

            color = detect_color(title)

            title_lower = title.lower()
            if any(w in title_lower for w in ["men ", "men's", "male", "boy "]):
                gender = "Men"
            elif any(w in title_lower for w in ["kid", "girl", "child"]):
                gender = "Kids"
            else:
                gender = default_gender

            original_price = round(price * random.uniform(1.15, 1.5), -1)
            discount_pct = round((1 - price / max(original_price, price + 1)) * 100)

            all_products.append({
                "name": title,
                "brand": store.capitalize(),
                "category": category,
                "subcategory": product_type,
                "color": color,
                "price": price,
                "original_price": original_price,
                "discount": f"{discount_pct}% OFF",
                "rating": round(random.uniform(3.8, 4.9), 1),
                "image_url": img_url,
                "description": "",
                "sizes": random.sample(["XS", "S", "M", "L", "XL", "XXL"], k=random.randint(3, 5)),
                "gender": gender,
                "tags": [category.lower(), color.lower(), gender.lower()],
            })

    return all_products


def select_catalog(all_products, per_category=20):
    """Pick top products per category, ensuring unique images."""
    from collections import defaultdict

    by_cat = defaultdict(list)
    for p in all_products:
        by_cat[p["category"]].append(p)

    final = []
    seen_imgs = set()

    target_order = [
        "Sarees", "Kurtas", "Suits", "Lehengas", "Dresses", "Shirts",
        "T-Shirts", "Jeans", "Trousers", "Jackets", "Tops", "Shorts",
        "Skirts", "Dupattas", "Footwear",
    ]

    for cat in target_order:
        pool = by_cat.get(cat, [])
        random.shuffle(pool)
        count = 0
        for p in pool:
            if p["image_url"] not in seen_imgs:
                seen_imgs.add(p["image_url"])
                final.append(p)
                count += 1
                if count >= per_category:
                    break
        print(f"  {cat}: {count} products selected (from {len(pool)} available)")

    random.shuffle(final)
    return final


def main():
    print("Step 1: Scraping Shopify stores...")
    if os.path.exists(RAW_FILE):
        print("  Using cached raw data. Delete data/raw_scraped.json to re-scrape.")
        with open(RAW_FILE) as f:
            raw_data = json.load(f)
        for store, products in raw_data.items():
            print(f"  {store}: {len(products)} products")
    else:
        raw_data = scrape_stores()

    print("\nStep 2: Processing products...")
    all_products = process_scraped(raw_data)
    print(f"  Total categorized: {len(all_products)}")

    print("\nStep 3: Selecting catalog...")
    catalog = select_catalog(all_products)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    unique_imgs = len(set(p["image_url"] for p in catalog))
    print(f"\nDone! {len(catalog)} products, {unique_imgs} unique images")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
