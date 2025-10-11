from fastapi import APIRouter, Depends, Query, Path, status
from src.db.main import get_db
from src.category.schema import CategoryCreate, CategoryUpdate, CategoryResponse
from src.category.service import CategoryService
from typing import Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_all_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str = Query("", max_length=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all categories with optional pagination and search.
    """
    return await CategoryService.get_all_categories(db, skip, limit, search)

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific category by its ID.
    """
    return await CategoryService.get_category(db, category_id)

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new category.
    """
    return await CategoryService.create_category(db, category)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int = Path(..., gt=0),
    category_update: CategoryUpdate = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific category.
    """
    return await CategoryService.update_category(db, category_id, category_update)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific category.
    """
    return await CategoryService.delete_category(db, category_id)