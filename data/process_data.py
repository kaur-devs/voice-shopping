"""
Process fashion product data for MongoDB seeding.

Usage:
  1. Download a fashion dataset CSV from Kaggle and place it in data/raw/
  2. Run: python process_data.py
  3. Output: data/processed_products.json (ready for seeding)

Expected CSV columns (flexible - script adapts to available columns):
  name, brand, category, price, color, image, rating, description, gender
"""

import os
import json
import csv
import re
import random

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "processed_products.json")

COLORS = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "maroon", "navy", "beige", "gold",
    "cream", "teal", "coral", "lavender", "olive", "rust", "burgundy",
]

CATEGORY_MAP = {
    "kurta": "Kurtas", "kurti": "Kurtas", "kurtis": "Kurtas",
    "saree": "Sarees", "sari": "Sarees",
    "shirt": "Shirts", "tshirt": "T-Shirts", "t-shirt": "T-Shirts",
    "jeans": "Jeans", "denim": "Jeans",
    "dress": "Dresses", "frock": "Dresses", "gown": "Dresses",
    "lehenga": "Lehengas", "lehnga": "Lehengas",
    "suit": "Suits", "salwar": "Suits",
    "jacket": "Jackets", "blazer": "Jackets",
    "trouser": "Trousers", "pant": "Trousers", "pants": "Trousers",
    "shorts": "Shorts",
    "skirt": "Skirts",
    "top": "Tops", "blouse": "Tops",
    "sweater": "Sweaters", "sweatshirt": "Sweaters", "hoodie": "Sweaters",
    "dupatta": "Dupattas", "scarf": "Dupattas",
}

SIZES = ["XS", "S", "M", "L", "XL", "XXL"]


def extract_color(text):
    text_lower = text.lower()
    for color in COLORS:
        if color in text_lower:
            return color.capitalize()
    return ""


def normalize_category(text):
    text_lower = text.lower()
    for keyword, category in CATEGORY_MAP.items():
        if keyword in text_lower:
            return category
    return text.strip().title() if text else "Other"


def extract_gender(text):
    text_lower = text.lower()
    if any(w in text_lower for w in ["women", "woman", "female", "ladies", "girl"]):
        return "Women"
    if any(w in text_lower for w in ["men", "male", "gents", "boy"]):
        return "Men"
    if any(w in text_lower for w in ["kid", "child", "infant", "baby"]):
        return "Kids"
    return "Unisex"


def clean_price(price_str):
    if not price_str:
        return 0.0
    cleaned = re.sub(r'[^\d.]', '', str(price_str))
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return 0.0


def generate_tags(product):
    tags = []
    if product.get("category"):
        tags.append(product["category"].lower())
    if product.get("color"):
        tags.append(product["color"].lower())
    if product.get("gender"):
        tags.append(product["gender"].lower())
    if product.get("brand"):
        tags.append(product["brand"].lower())
    return tags


def find_csv_files():
    if not os.path.exists(RAW_DIR):
        return []
    return [f for f in os.listdir(RAW_DIR) if f.endswith(".csv")]


def detect_columns(headers):
    """Map CSV headers to our standard fields."""
    header_lower = [h.lower().strip() for h in headers]
    mapping = {}

    name_candidates = ["name", "product_name", "productname", "title", "product"]
    brand_candidates = ["brand", "brand_name", "brandname", "manufacturer"]
    category_candidates = ["category", "product_category", "type", "articletype", "article_type"]
    price_candidates = ["price", "selling_price", "sellingprice", "mrp", "discounted_price"]
    color_candidates = ["color", "colour", "basecolour", "base_colour"]
    image_candidates = ["image", "image_url", "imageurl", "img", "link", "image_link"]
    rating_candidates = ["rating", "ratings", "avg_rating", "stars"]
    description_candidates = ["description", "desc", "product_description", "details"]
    gender_candidates = ["gender", "sex", "for"]
    discount_candidates = ["discount", "discount_percent", "off"]
    subcategory_candidates = ["subcategory", "sub_category", "subtype"]

    for field, candidates in [
        ("name", name_candidates),
        ("brand", brand_candidates),
        ("category", category_candidates),
        ("price", price_candidates),
        ("color", color_candidates),
        ("image_url", image_candidates),
        ("rating", rating_candidates),
        ("description", description_candidates),
        ("gender", gender_candidates),
        ("discount", discount_candidates),
        ("subcategory", subcategory_candidates),
    ]:
        for candidate in candidates:
            if candidate in header_lower:
                mapping[field] = headers[header_lower.index(candidate)]
                break

    return mapping


def process_csv(filepath):
    products = []

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return []

        col_map = detect_columns(reader.fieldnames)
        print(f"  Detected columns: {col_map}")

        for row in reader:
            name = row.get(col_map.get("name", ""), "").strip()
            if not name:
                continue

            price = clean_price(row.get(col_map.get("price", ""), "0"))
            if price <= 0:
                price = round(random.uniform(299, 4999), 0)

            color = row.get(col_map.get("color", ""), "")
            if not color:
                color = extract_color(name)

            gender_raw = row.get(col_map.get("gender", ""), "")
            gender = extract_gender(gender_raw or name)

            category_raw = row.get(col_map.get("category", ""), "")
            category = normalize_category(category_raw or name)

            original_price = price * random.uniform(1.1, 1.8)
            discount_pct = round((1 - price / original_price) * 100)

            product = {
                "name": name,
                "brand": row.get(col_map.get("brand", ""), "").strip() or "Unknown",
                "category": category,
                "subcategory": row.get(col_map.get("subcategory", ""), "").strip(),
                "color": color.strip().capitalize() if color else "",
                "price": price,
                "original_price": round(original_price, 0),
                "discount": f"{discount_pct}% OFF",
                "rating": min(5.0, max(0, float(row.get(col_map.get("rating", ""), "0") or "0"))),
                "image_url": row.get(col_map.get("image_url", ""), "").strip(),
                "description": row.get(col_map.get("description", ""), "").strip(),
                "sizes": random.sample(SIZES, k=random.randint(3, 6)),
                "gender": gender,
            }
            product["tags"] = generate_tags(product)
            products.append(product)

    return products


def generate_sample_data():
    """Generate sample fashion products if no CSV is available."""
    print("No CSV found in data/raw/ — generating sample product data...")

    brands = ["FabIndia", "Biba", "W", "Manyavar", "Allen Solly", "Peter England",
              "Aurelia", "Global Desi", "Libas", "Anouk", "Roadster", "HRX"]

    items = [
        ("Red Silk Kurta", "Kurtas", "Red", "Women", 1299),
        ("Blue Denim Jeans", "Jeans", "Blue", "Men", 999),
        ("Black Cotton T-Shirt", "T-Shirts", "Black", "Men", 499),
        ("Pink Chiffon Saree", "Sarees", "Pink", "Women", 2499),
        ("Green Anarkali Suit", "Suits", "Green", "Women", 1899),
        ("Navy Formal Shirt", "Shirts", "Navy", "Men", 1199),
        ("White Palazzo Pants", "Trousers", "White", "Women", 799),
        ("Maroon Bridal Lehenga", "Lehengas", "Maroon", "Women", 8999),
        ("Yellow Printed Kurti", "Kurtas", "Yellow", "Women", 699),
        ("Grey Casual Jacket", "Jackets", "Grey", "Men", 1599),
        ("Orange Ethnic Dress", "Dresses", "Orange", "Women", 1399),
        ("Brown Leather Jacket", "Jackets", "Brown", "Men", 2999),
        ("Purple Cotton Dupatta", "Dupattas", "Purple", "Women", 399),
        ("Beige Formal Trouser", "Trousers", "Beige", "Men", 1099),
        ("Gold Embroidered Kurta", "Kurtas", "Gold", "Men", 1799),
        ("Teal A-Line Dress", "Dresses", "Teal", "Women", 1499),
        ("Coral Printed Top", "Tops", "Coral", "Women", 599),
        ("Black Slim Fit Jeans", "Jeans", "Black", "Men", 1299),
        ("Red Bandhani Saree", "Sarees", "Red", "Women", 3499),
        ("Blue Striped Shirt", "Shirts", "Blue", "Men", 899),
        ("White Chikankari Kurta", "Kurtas", "White", "Women", 1599),
        ("Pink Floral Skirt", "Skirts", "Pink", "Women", 699),
        ("Black Formal Blazer", "Jackets", "Black", "Men", 3499),
        ("Olive Cargo Shorts", "Shorts", "Olive", "Men", 799),
        ("Lavender Cotton Saree", "Sarees", "Lavender", "Women", 1899),
        ("Rust Printed Kurta", "Kurtas", "Rust", "Women", 899),
        ("Navy Polo T-Shirt", "T-Shirts", "Navy", "Men", 699),
        ("Cream Silk Lehenga", "Lehengas", "Cream", "Women", 6999),
        ("Green Checked Shirt", "Shirts", "Green", "Men", 999),
        ("Maroon Velvet Suit", "Suits", "Maroon", "Women", 2499),
        ("Blue Denim Jacket", "Jackets", "Blue", "Men", 1899),
        ("White Palazzo Set", "Suits", "White", "Women", 1299),
        ("Black Party Dress", "Dresses", "Black", "Women", 1999),
        ("Red Silk Dupatta", "Dupattas", "Red", "Women", 599),
        ("Yellow Printed Shirt", "Shirts", "Yellow", "Men", 799),
        ("Pink Georgette Saree", "Sarees", "Pink", "Women", 2899),
        ("Grey Jogger Pants", "Trousers", "Grey", "Men", 899),
        ("Blue Embroidered Kurta", "Kurtas", "Blue", "Women", 1399),
        ("Brown Chelsea Boots", "Footwear", "Brown", "Men", 2499),
        ("Green Silk Lehenga", "Lehengas", "Green", "Women", 7499),
        ("Black Crop Top", "Tops", "Black", "Women", 499),
        ("White Linen Shirt", "Shirts", "White", "Men", 1299),
        ("Orange Printed Kurti", "Kurtas", "Orange", "Women", 749),
        ("Navy Chinos", "Trousers", "Navy", "Men", 1199),
        ("Burgundy Sherwani", "Suits", "Burgundy", "Men", 5999),
        ("Cream Anarkali Dress", "Dresses", "Cream", "Women", 2199),
        ("Red Checked Shirt", "Shirts", "Red", "Men", 899),
        ("Pink Printed Dupatta", "Dupattas", "Pink", "Women", 349),
        ("Blue Cotton Kurta", "Kurtas", "Blue", "Men", 999),
        ("Black Denim Shorts", "Shorts", "Black", "Men", 699),
    ]

    products = []
    for name, category, color, gender, price in items:
        brand = random.choice(brands)
        original_price = round(price * random.uniform(1.2, 1.8))
        discount_pct = round((1 - price / original_price) * 100)

        product = {
            "name": f"{brand} {name}",
            "brand": brand,
            "category": category,
            "subcategory": "",
            "color": color,
            "price": price,
            "original_price": original_price,
            "discount": f"{discount_pct}% OFF",
            "rating": round(random.uniform(3.2, 4.9), 1),
            "image_url": "",
            "description": f"Stylish {color.lower()} {category.lower()} by {brand}. Perfect for any occasion.",
            "sizes": random.sample(SIZES, k=random.randint(3, 6)),
            "gender": gender,
            "tags": [category.lower(), color.lower(), gender.lower(), brand.lower()],
        }
        products.append(product)

    return products


def main():
    csv_files = find_csv_files()
    all_products = []

    if csv_files:
        for csv_file in csv_files:
            filepath = os.path.join(RAW_DIR, csv_file)
            print(f"Processing: {csv_file}")
            products = process_csv(filepath)
            print(f"  Extracted {len(products)} products")
            all_products.extend(products)
    else:
        all_products = generate_sample_data()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\nTotal products: {len(all_products)}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
