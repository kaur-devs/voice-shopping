"""
Train a content-based recommendation model using product features.

Usage:
  cd backend
  python -m ml.train_recommender
"""

import asyncio
import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from motor.motor_asyncio import AsyncIOMotorClient

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.config import MONGODB_URI, DATABASE_NAME

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "recommender.pkl")


def build_feature_text(product: dict) -> str:
    parts = [
        product.get("name", ""),
        product.get("category", ""),
        product.get("subcategory", ""),
        product.get("brand", ""),
        product.get("color", ""),
        product.get("gender", ""),
        product.get("description", ""),
        " ".join(product.get("tags", [])),
    ]
    return " ".join(p for p in parts if p).lower()


async def fetch_products():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    products = []
    async for doc in db.products.find({}):
        doc["_id"] = str(doc["_id"])
        products.append(doc)

    client.close()
    return products


def train(products: list):
    if len(products) < 2:
        print("Need at least 2 products to train. Seed data first.")
        return

    product_ids = [p["_id"] for p in products]
    feature_texts = [build_feature_text(p) for p in products]

    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(feature_texts)

    similarity_matrix = cosine_similarity(tfidf_matrix)

    os.makedirs(MODEL_DIR, exist_ok=True)
    model_data = {
        "product_ids": product_ids,
        "similarity_matrix": similarity_matrix,
        "vectorizer": vectorizer,
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model_data, f)

    print(f"Trained on {len(products)} products")
    print(f"TF-IDF features: {tfidf_matrix.shape[1]}")
    print(f"Model saved to: {MODEL_PATH}")

    idx = 0
    scores = list(enumerate(similarity_matrix[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    print(f"\nSample: Top 3 similar to '{products[idx]['name']}':")
    for i, score in scores[1:4]:
        print(f"  {products[i]['name']} (score: {score:.3f})")


async def main():
    print("Fetching products from MongoDB...")
    products = await fetch_products()
    print(f"Found {len(products)} products")

    print("Training recommendation model...")
    train(products)


if __name__ == "__main__":
    asyncio.run(main())
