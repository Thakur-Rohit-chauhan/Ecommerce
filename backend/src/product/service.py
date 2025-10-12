from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, desc, or_, func
from src.product.models import Product
from src.product.schema import ProductCreate, ProductUpdate
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from src.common.response import ResponseHandler
from src.common.exceptions import NotFoundError, ValidationError
from decimal import Decimal

class ProductService:
    @staticmethod
    async def get_all_products(db: AsyncSession, page: int, limit: int, search: str = "") -> Dict[str, Any]:
        try:
            offset = (page - 1) * limit
            query = select(Product)
            
            if search:
                query = query.where(or_(
                    Product.title.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                ))
            
            query = query.order_by(desc(Product.created_at)).offset(offset).limit(limit)
            result = await db.execute(query)
            products = result.scalars().all()
            
            # Get total count for pagination
            count_query = select(func.count()).select_from(Product)
            if search:
                count_query = count_query.where(or_(
                    Product.title.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                ))
            total_count = await db.scalar(count_query)
            
            return {
                "message": f"Successfully retrieved products for page {page}",
                "data": products,
                "metadata": {
                    "page": page,
                    "limit": limit,
                    "total": total_count,
                    "pages": (total_count + limit - 1) // limit
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving products: {str(e)}"
            )

    @staticmethod
    async def get_product(db: AsyncSession, product_id: str) -> Product:
        try:
            query = select(Product).where(Product.id == product_id)
            result = await db.execute(query)
            product = result.scalar_one_or_none()
            if not product:
                raise NotFoundError("Product", product_id)
            return ResponseHandler.get_single_success(product.title, product_id, product)
        except NotFoundError:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving product: {str(e)}"
            )

    @staticmethod
    async def create_product(db: AsyncSession, product: ProductCreate) -> Product:
        try:
            product_dict = product.model_dump()
            db_product = Product(**product_dict)
            db.add(db_product)
            await db.commit()
            await db.refresh(db_product)
            return ResponseHandler.create_success(db_product.title, db_product.id, db_product)
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating product: {str(e)}"
            )

    @staticmethod
    async def update_product(db: AsyncSession, product_id: str, updated_product: ProductUpdate) -> Product:
        try:
            query = select(Product).where(Product.id == product_id)
            result = await db.execute(query)
            db_product = result.scalar_one_or_none()
            if not db_product:
                raise NotFoundError("Product", product_id)

            for key, value in updated_product.model_dump(exclude_unset=True).items():
                setattr(db_product, key, value)
            db_product.updated_at = datetime.utcnow()

            db.add(db_product)
            await db.commit()
            await db.refresh(db_product)
            return ResponseHandler.update_success(db_product.title, db_product.id, db_product)
        except NotFoundError:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating product: {str(e)}"
            )

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: str) -> Product:
        try:
            query = select(Product).where(Product.id == product_id)
            result = await db.execute(query)
            db_product = result.scalar_one_or_none()
            if not db_product:
                raise NotFoundError("Product", product_id)
            await db.delete(db_product)
            await db.commit()
            return ResponseHandler.delete_success(db_product.title, db_product.id, db_product)
        except NotFoundError:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting product: {str(e)}"
            )