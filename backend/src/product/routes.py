from fastapi import APIRouter, Depends, Query, status
from src.db.main import get_db
from fastapi.exceptions import HTTPException
from src.product.schema import ProductCreate, ProductUpdate, Product
from src.product.service import ProductService
from src.common.exceptions import NotFoundError
from src.auth.utils import get_current_active_user, require_seller_or_admin
from src.auth.user.models import User
from typing import List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query("", max_length=50),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    try:
        return await ProductService.get_all_products(db, page, limit, search)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{product_id}", status_code=status.HTTP_200_OK)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ProductService.get_product(db, product_id)
    except NotFoundError:
        raise
    except Exception as e:
        raise e

@router.post("/", status_code=status.HTTP_201_CREATED) 
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(require_seller_or_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ProductService.create_product(db, product, current_user)
    except Exception as e:
        raise e

@router.put("/{product_id}", status_code=status.HTTP_200_OK)
async def update_product(
    product_id: str,
    updated_product: ProductUpdate,
    current_user: User = Depends(require_seller_or_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ProductService.update_product(db, product_id, updated_product, current_user)
    except NotFoundError:
        raise
    except Exception as e:
        raise e

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: str,
    current_user: User = Depends(require_seller_or_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ProductService.delete_product(db, product_id, current_user)
    except NotFoundError:
        raise
    except Exception as e:
        raise e