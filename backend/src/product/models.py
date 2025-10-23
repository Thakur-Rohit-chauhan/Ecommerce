from sqlmodel import SQLModel, Field, Column, Relationship
import uuid
from typing import Optional, List, TYPE_CHECKING
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime
from decimal import Decimal

if TYPE_CHECKING:
    from src.auth.user.models import User
    from src.category.models import Category
    from src.cart.models import CartItem

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    )
    title: str = Field(index=True, nullable=False, max_length=100)
    description: Optional[str] = Field(default=None, nullable=True, max_length=500)
    price: Decimal = Field(sa_column=Column(pg.NUMERIC(10, 2), nullable=False))
    discount_percentage: float = Field(nullable=False, ge=0, le=100)
    rating: float = Field(nullable=False, ge=0, le=5)
    stock: int = Field(nullable=False, ge=0)
    brand: str = Field(nullable=False, max_length=100)
    thumbnail: str = Field(nullable=False)
    images: List[str] = Field(sa_column=Column(pg.ARRAY(pg.TEXT), nullable=False))

    # Seller
    seller_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    seller: Optional["User"] = Relationship()

    created_at: datetime = Field(sa_column=Column(pg.TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False))
    updated_at: Optional[datetime] = Field(
        sa_column=Column(pg.TIMESTAMP(timezone=True), default=None, onupdate=datetime.utcnow),
        default=None
    )

    category_id: uuid.UUID = Field(foreign_key="categories.id", nullable=False)
    category: Optional["Category"] = Relationship(back_populates="products")

    cart_items: List["CartItem"] = Relationship(back_populates="product")

    def __repr__(self):
        return f"<Product(id={self.id}, title={self.title}, price={self.price})>"
