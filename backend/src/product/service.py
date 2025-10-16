from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, desc, or_, func
from src.product.models import Product
from src.product.schema import ProductCreate, ProductUpdate
from src.auth.user.models import User, UserRole
from src.common.location_utils import LocationUtils
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from src.common.response import ResponseHandler
from src.common.exceptions import NotFoundError, ValidationError
from decimal import Decimal

class ProductService:
    @staticmethod
    async def get_all_products(
        db: AsyncSession, 
        page: int, 
        limit: int, 
        search: str = "",
        user_lat: Optional[float] = None,
        user_lon: Optional[float] = None,
        max_distance_km: Optional[float] = None,
        sort_by_distance: bool = False
    ) -> Dict[str, Any]:
        try:
            offset = (page - 1) * limit
            
            # Join with User table to get seller location
            query = select(Product, User).join(User, Product.seller_id == User.id)
            
            if search:
                query = query.where(or_(
                    Product.title.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                ))
            
            # Execute query to get all matching products with seller info
            result = await db.execute(query)
            product_seller_pairs = result.all()
            
            # Calculate distances and filter
            products_with_distance = []
            for product, seller in product_seller_pairs:
                # Calculate distance if user location is provided
                distance = None
                if user_lat is not None and user_lon is not None:
                    distance = LocationUtils.calculate_distance(
                        user_lat, user_lon, 
                        seller.latitude, seller.longitude
                    )
                
                # Filter by max distance if specified
                if max_distance_km is not None:
                    if not LocationUtils.is_within_radius(distance, max_distance_km):
                        continue
                
                products_with_distance.append({
                    "product": product,
                    "distance": distance,
                    "seller_city": seller.city,
                    "seller_state": seller.state
                })
            
            # Sort by distance if requested and user location is provided
            if sort_by_distance and user_lat is not None and user_lon is not None:
                # Sort by distance, putting None distances at the end
                products_with_distance.sort(
                    key=lambda x: (x["distance"] is None, x["distance"] if x["distance"] is not None else float('inf'))
                )
            else:
                # Sort by created_at (newest first)
                products_with_distance.sort(
                    key=lambda x: x["product"].created_at,
                    reverse=True
                )
            
            # Apply pagination
            total_count = len(products_with_distance)
            paginated_products = products_with_distance[offset:offset + limit]
            
            # Format response
            formatted_products = []
            for item in paginated_products:
                product_dict = {
                    "id": item["product"].id,
                    "title": item["product"].title,
                    "description": item["product"].description,
                    "price": item["product"].price,
                    "discount_percentage": item["product"].discount_percentage,
                    "rating": item["product"].rating,
                    "stock": item["product"].stock,
                    "brand": item["product"].brand,
                    "thumbnail": item["product"].thumbnail,
                    "images": item["product"].images,
                    "category_id": item["product"].category_id,
                    "seller_id": item["product"].seller_id,
                    "created_at": item["product"].created_at,
                    "updated_at": item["product"].updated_at,
                    "distance_km": item["distance"],
                    "distance_formatted": LocationUtils.format_distance(item["distance"]),
                    "seller_location": {
                        "city": item["seller_city"],
                        "state": item["seller_state"]
                    }
                }
                formatted_products.append(product_dict)
            
            return {
                "message": f"Successfully retrieved products for page {page}",
                "data": formatted_products,
                "metadata": {
                    "page": page,
                    "limit": limit,
                    "total": total_count,
                    "pages": (total_count + limit - 1) // limit if limit > 0 else 0,
                    "sorted_by_distance": sort_by_distance and user_lat is not None,
                    "max_distance_km": max_distance_km
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
    async def create_product(db: AsyncSession, product: ProductCreate, current_user: User) -> Product:
        try:
            # Check if user has permission to create products
            if current_user.role not in [UserRole.SELLER, UserRole.ADMIN]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only sellers and admins can create products"
                )
            
            product_dict = product.model_dump()
            # Add seller_id to track who created the product
            product_dict["seller_id"] = current_user.id
            db_product = Product(**product_dict)
            db.add(db_product)
            await db.commit()
            await db.refresh(db_product)
            return ResponseHandler.create_success(db_product.title, db_product.id, db_product)
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating product: {str(e)}"
            )

    @staticmethod
    async def update_product(db: AsyncSession, product_id: str, updated_product: ProductUpdate, current_user: User) -> Product:
        try:
            query = select(Product).where(Product.id == product_id)
            result = await db.execute(query)
            db_product = result.scalar_one_or_none()
            if not db_product:
                raise NotFoundError("Product", product_id)
            
            # Authorization: Only the seller who created the product or admin can update it
            if current_user.role != UserRole.ADMIN and db_product.seller_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update products that you created. Only the product owner or admin can update this product."
                )

            for key, value in updated_product.model_dump(exclude_unset=True).items():
                setattr(db_product, key, value)
            db_product.updated_at = datetime.utcnow()

            db.add(db_product)
            await db.commit()
            await db.refresh(db_product)
            return ResponseHandler.update_success(db_product.title, db_product.id, db_product)
        except (NotFoundError, HTTPException):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating product: {str(e)}"
            )

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: str, current_user: User) -> Product:
        try:
            query = select(Product).where(Product.id == product_id)
            result = await db.execute(query)
            db_product = result.scalar_one_or_none()
            if not db_product:
                raise NotFoundError("Product", product_id)
            
            # Authorization: Only the seller who created the product or admin can delete it
            if current_user.role != UserRole.ADMIN and db_product.seller_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete products that you created. Only the product owner or admin can delete this product."
                )
            
            await db.delete(db_product)
            await db.commit()
            return ResponseHandler.delete_success(db_product.title, db_product.id, db_product)
        except (NotFoundError, HTTPException):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting product: {str(e)}"
            )