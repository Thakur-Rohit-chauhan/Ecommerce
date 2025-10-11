from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime

class CartItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)

class CartItemResponse(CartItemBase):
    id: uuid.UUID
    cart_id: uuid.UUID
    subtotal_price: float
    
    class Config:
        orm_mode = True

class CartBase(BaseModel):
    total_price: float = Field(default=0.0, ge=0)

class CartCreate(CartBase):
    pass

class CartUpdate(BaseModel):
    pass  # Cart updates are handled through cart items

class CartResponse(CartBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]
    cart_items: List[CartItemResponse]
    
    class Config:
        orm_mode = True