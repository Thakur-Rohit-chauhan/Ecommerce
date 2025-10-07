from sqlmodel import SQLModel, Field, Column
import uuid
from typing import Optional
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id : uuid.UUID = Field(
        sa_column = Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            unique=True,
            nullable=False
        )
    )
    title : str = Field(index=True, nullable=False)
    description : Optional[str] = Field(default=None, nullable=True)
    price : int = Field(nullable=False)
    discount_percentage : float = Field(nullable=False)
    rating : float = Field(nullable=False)
    stock : int = Field(nullable=False)
    brand : str = Field(nullable=False)
    thumbnail : str = Field(nullable=False)
    images : list[str] = Field(
        sa_column = Column(
            pg.ARRAY(pg.TEXT),
            nullable=False
        )
    )
    created_at : datetime = Field(
        sa_column = Column(
            pg.TIMESTAMP(timezone=True),
            default=datetime.utcnow,
            nullable=False
        )
    )
    updated_at : Optional[datetime] = Field(
        sa_column = Column(
            pg.TIMESTAMP(timezone=True),
            default=None,
            onupdate=datetime.utcnow,
        ),
        default=None
    )

    # category_id : int = Field(nullable=False, foreign_key="categories.id")
    # category : Optional["Category"] = Relationship(back_populates="products")

    # cart_items : list["CartItem"] = Relationship(back_populates="product")

def __repr__(self):
    return f"<Product(id={self.id}, title={self.title}, price={self.price})>"