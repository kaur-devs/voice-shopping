from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import connect_db, close_db

app = FastAPI(
    title="Voice Shopping for Bharat",
    description="AI-powered voice shopping assistant for regional Indian languages",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Voice Shopping API is running"}
