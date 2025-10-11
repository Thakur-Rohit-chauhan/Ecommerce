from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from src.cart.models import Cart, CartItem
from src.cart.schema import CartCreate, CartItemCreate, CartItemUpdate
from src.product.models import Product
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from src.common.response import ResponseHandler
import uuid

class CartService:
    @staticmethod
    async def get_cart(db: AsyncSession, cart_id: uuid.UUID) -> Cart:
        query = select(Cart).where(Cart.id == cart_id)
        result = await db.execute(query)
        cart = result.scalar_one_or_none()
        
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
            
        return ResponseHandler.get_single_success("Cart", cart_id, cart)

    @staticmethod
    async def create_cart(db: AsyncSession, cart: CartCreate) -> Cart:
        db_cart = Cart(**cart.dict())
        db.add(db_cart)
        await db.commit()
        await db.refresh(db_cart)
        return ResponseHandler.create_success("Cart", db_cart.id, db_cart)

    @staticmethod
    async def delete_cart(db: AsyncSession, cart_id: uuid.UUID) -> None:
        query = select(Cart).where(Cart.id == cart_id)
        result = await db.execute(query)
        cart = result.scalar_one_or_none()
        
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
            
        await db.delete(cart)
        await db.commit()
        return ResponseHandler.delete_success("Cart", cart_id, cart)

    @staticmethod
    async def add_item_to_cart(db: AsyncSession, cart_id: uuid.UUID, item: CartItemCreate) -> CartItem:
        # Verify cart exists
        cart_query = select(Cart).where(Cart.id == cart_id)
        cart_result = await db.execute(cart_query)
        cart = cart_result.scalar_one_or_none()
        
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
            
        # Verify product exists and get its price
        product_query = select(Product).where(Product.id == item.product_id)
        product_result = await db.execute(product_query)
        product = product_result.scalar_one_or_none()
        
        if not product:
            ResponseHandler.not_found_error("Product", item.product_id)
            
        # Calculate subtotal
        subtotal = product.price * item.quantity
        
        # Create cart item
        cart_item = CartItem(
            cart_id=cart_id,
            product_id=item.product_id,
            quantity=item.quantity,
            subtotal_price=subtotal
        )
        
        # Update cart total
        cart.total_price += subtotal
        cart.updated_at = datetime.utcnow()
        
        db.add(cart_item)
        db.add(cart)
        await db.commit()
        await db.refresh(cart_item)
        
        return ResponseHandler.create_success("Cart Item", cart_item.id, cart_item)

    @staticmethod
    async def update_cart_item(
        db: AsyncSession,
        cart_id: uuid.UUID,
        item_id: uuid.UUID,
        item_update: CartItemUpdate
    ) -> CartItem:
        # Get cart item
        query = select(CartItem).where(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
        result = await db.execute(query)
        cart_item = result.scalar_one_or_none()
        
        if not cart_item:
            ResponseHandler.not_found_error("Cart Item", item_id)
            
        # Get product for price calculation
        product_query = select(Product).where(Product.id == cart_item.product_id)
        product_result = await db.execute(product_query)
        product = product_result.scalar_one_or_none()
        
        if not product:
            ResponseHandler.not_found_error("Product", cart_item.product_id)
            
        # Get cart for total update
        cart_query = select(Cart).where(Cart.id == cart_id)
        cart_result = await db.execute(cart_query)
        cart = cart_result.scalar_one_or_none()
        
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
            
        # Update quantity and recalculate prices
        old_subtotal = cart_item.subtotal_price
        cart_item.quantity = item_update.quantity
        cart_item.subtotal_price = product.price * item_update.quantity
        
        # Update cart total
        cart.total_price = cart.total_price - old_subtotal + cart_item.subtotal_price
        cart.updated_at = datetime.utcnow()
        
        db.add(cart_item)
        db.add(cart)
        await db.commit()
        await db.refresh(cart_item)
        
        return ResponseHandler.update_success("Cart Item", item_id, cart_item)

    @staticmethod
    async def remove_cart_item(
        db: AsyncSession,
        cart_id: uuid.UUID,
        item_id: uuid.UUID
    ) -> None:
        # Get cart item
        query = select(CartItem).where(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
        result = await db.execute(query)
        cart_item = result.scalar_one_or_none()
        
        if not cart_item:
            ResponseHandler.not_found_error("Cart Item", item_id)
            
        # Get cart for total update
        cart_query = select(Cart).where(Cart.id == cart_id)
        cart_result = await db.execute(cart_query)
        cart = cart_result.scalar_one_or_none()
        
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
            
        # Update cart total
        cart.total_price -= cart_item.subtotal_price
        cart.updated_at = datetime.utcnow()
        
        await db.delete(cart_item)
        db.add(cart)
        await db.commit()
        
        return ResponseHandler.delete_success("Cart Item", item_id, cart_item)
