from fastapi import APIRouter, Depends, status, Path
from src.db.main import get_db
from src.cart.schema import CartCreate, CartResponse, CartItemCreate, CartItemUpdate, CartItemResponse
from src.cart.service import CartService
from src.auth.utils import get_current_active_user
from src.auth.user.models import User
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession
import uuid

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_cart(
    cart: CartCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new shopping cart (requires authentication)"""
    return await CartService.create_cart(db, cart, current_user)

@router.get("/{cart_id}")
async def get_cart(
    cart_id: uuid.UUID = Path(..., title="The ID of the cart to retrieve"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific cart by its ID (requires authentication)"""
    return await CartService.get_cart(db, cart_id, current_user)

@router.delete("/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart(
    cart_id: uuid.UUID = Path(..., title="The ID of the cart to delete"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific cart (requires authentication)"""
    return await CartService.delete_cart(db, cart_id, current_user)

@router.post("/{cart_id}/items")
async def add_item_to_cart(
    cart_id: uuid.UUID = Path(..., title="The ID of the cart to add an item to"),
    item: CartItemCreate = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add an item to a cart (requires authentication)"""
    return await CartService.add_item_to_cart(db, cart_id, item, current_user)

@router.put("/{cart_id}/items/{item_id}")
async def update_cart_item(
    cart_id: uuid.UUID = Path(..., title="The ID of the cart"),
    item_id: uuid.UUID = Path(..., title="The ID of the item to update"),
    item_update: CartItemUpdate = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific item in a cart (requires authentication)"""
    return await CartService.update_cart_item(db, cart_id, item_id, item_update, current_user)

@router.delete("/{cart_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cart_item(
    cart_id: uuid.UUID = Path(..., title="The ID of the cart"),
    item_id: uuid.UUID = Path(..., title="The ID of the item to remove"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a specific item from a cart (requires authentication)"""
    return await CartService.remove_cart_item(db, cart_id, item_id, current_user)
