from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime
from decimal import Decimal

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
    subtotal_price: Decimal
    
    class Config:
        orm_mode = True

class CartBase(BaseModel):
    total_price: Decimal = Field(default=Decimal('0.00'), decimal_places=2)

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