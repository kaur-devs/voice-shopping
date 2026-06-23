from pydantic import BaseModel
from datetime import datetime


class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: str = ""


class Cart(BaseModel):
    session_id: str
    items: list[CartItem] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
