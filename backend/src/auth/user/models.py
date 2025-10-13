from sqlmodel import SQLModel, Field, Column
import uuid
from typing import Optional, List, TYPE_CHECKING
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime
from sqlmodel import Relationship
from enum import Enum

if TYPE_CHECKING:
    from src.orders.models import Order

class UserRole(str, Enum):
    NORMAL_USER = "normal_user"
    SELLER = "seller"
    ADMIN = "admin"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            unique=True,
            nullable=False
        )
    )
    email: str = Field(index=True, nullable=False, unique=True, max_length=255)
    username: str = Field(index=True, nullable=False, unique=True, max_length=50)
    hashed_password: str = Field(nullable=False)
    full_name: str = Field(nullable=False, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True, nullable=False)
    is_verified: bool = Field(default=False, nullable=False)
    role: UserRole = Field(default=UserRole.NORMAL_USER, nullable=False)
    
    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP(timezone=True),
            default=datetime.utcnow,
            nullable=False
        )
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(
            pg.TIMESTAMP(timezone=True),
            default=None,
            onupdate=datetime.utcnow,
        ),
        default=None
    )
    last_login: Optional[datetime] = Field(
        sa_column=Column(
            pg.TIMESTAMP(timezone=True),
            default=None
        ),
        default=None
    )

    # Relationships
    orders: List["Order"] = Relationship(back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
