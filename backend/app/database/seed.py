"""
Seed MongoDB with processed product data.

Usage:
  cd backend
  python -m app.database.seed
"""

import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME

DATA_FILE = os.path.join(os.path.dirname(__file__), "../../../data/processed_products.json")


async def seed():
    if not os.path.exists(DATA_FILE):
        print(f"Data file not found: {DATA_FILE}")
        print("Run 'python data/process_data.py' first to generate product data.")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    if not products:
        print("No products found in data file.")
        return

    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    existing = await db.products.count_documents({})
    if existing > 0:
        print(f"Found {existing} existing products. Dropping collection...")
        await db.products.drop()

    result = await db.products.insert_many(products)
    print(f"Inserted {len(result.inserted_ids)} products into MongoDB.")

    await db.products.create_index([("name", "text"), ("category", "text"), ("tags", "text")])
    await db.products.create_index("category")
    await db.products.create_index("gender")
    await db.products.create_index("price")
    await db.products.create_index("color")
    print("Created indexes on: name(text), category, gender, price, color")

    sample = await db.products.find_one()
    print(f"\nSample product: {sample.get('name')} — Rs.{sample.get('price')}")

    client.close()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(seed())
