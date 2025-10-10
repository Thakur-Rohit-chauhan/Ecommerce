from sqlmodel import SQLModel, Field, Column
import uuid
from typing import Optional
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime
from sqlmodel import Relationship
# from src.product.models import Product
# from src.user.models import User

class Cart(SQLModel, table=True):
    __tablename__ = 'carts'


    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            unique=True,
            nullable=False
        )
    )
    # user_id: int = Field(nullable=False, foreign_key="users.id")
    # user: Optional["User"] = Relationship(back_populates="cart")
    created_at: datetime = Field(
        sa_column = Column(
            pg.TIMESTAMP(timezone = True),
            default = datetime.utcnow,
            nullable = False
        )
    )
    updated_at: Optional[datetime] = Field(
        sa_column = Column(
            pg.TIMESTAMP(timezone = True),
            default = None,
            onupdate = datetime.utcnow,
        )
    , default = None)
    cart_items: list["CartItem"] = Relationship(back_populates="cart")
    total_price: float = Field(default=0.0, nullable=False)



class CartItem(SQLModel, table=True):
    __tablename__ = 'cart_items'

    id: uuid.UUID = Field(
        sa_column = Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            unique=True,
            nullable=False
        )
    )
    cart_id: uuid.UUID = Field(nullable=False, foreign_key="carts.id")
    cart: Optional["Cart"] = Relationship(back_populates="cart_items")
    product_id: uuid.UUID = Field(nullable=False, foreign_key="products.id")
    product: "Product" = Relationship(back_populates="cart_items")    
    quantity: int = Field(default=1, nullable=False)
    subtotal_price: float = Field(default=0.0, nullable=False)