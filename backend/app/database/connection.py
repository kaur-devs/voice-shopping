import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
        _db = client[DATABASE_NAME]
        await _db.products.create_index([("name", "text"), ("category", "text"), ("tags", "text")])
        db = _db
        print(f"Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        client = None
        db = None
        print(f"Warning: Could not connect to MongoDB: {e}")
        print("Server will start but database operations will fail")


async def close_db():
    global client
    if client is not None:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
