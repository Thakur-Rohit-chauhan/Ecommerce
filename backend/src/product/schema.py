
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime

class ProductBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: int = Field(..., ge=0)
    discount_percentage: float = Field(..., ge=0)
    rating: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    brand: str = Field(..., max_length=100)
    thumbnail: str
    images: List[str]
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[int] = Field(None, ge=0)
    discount_percentage: Optional[float] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    brand: Optional[str] = Field(None, max_length=100)
    thumbnail: Optional[str] = None
    images: Optional[List[str]] = None
    category_id: Optional[int] = None

class Product(ProductBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True