from pydantic import BaseModel, Field
from typing import Optional


class Product(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    brand: str = ""
    category: str = ""
    subcategory: str = ""
    color: str = ""
    price: float = 0
    original_price: float = 0
    discount: str = ""
    rating: float = 0
    image_url: str = ""
    description: str = ""
    sizes: list[str] = []
    tags: list[str] = []
    gender: str = ""

    class Config:
        populate_by_name = True
