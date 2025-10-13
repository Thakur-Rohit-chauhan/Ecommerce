from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from src.auth.user.models import User, UserRole
from src.auth.user.schema import UserCreate, UserUpdate, UserLogin, PasswordChange
from src.auth.utils import get_password_hash, verify_password, create_access_token
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from src.common.response import ResponseHandler
from src.common.exceptions import NotFoundError, ConflictError, ValidationError
from src.config import Config
import uuid

class UserService:
    @staticmethod
    async def get_all_users(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        search: str = "",
        role: Optional[UserRole] = None
    ) -> Dict[str, Any]:
        try:
            query = select(User)
            
            # Apply filters
            if search:
                query = query.where(
                    User.username.ilike(f"%{search}%") |
                    User.email.ilike(f"%{search}%") |
                    User.full_name.ilike(f"%{search}%")
                )
            
            if role:
                query = query.where(User.role == role)
            
            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            users = result.scalars().all()
            
            # Get total count
            count_query = select(func.count()).select_from(User)
            if search:
                count_query = count_query.where(
                    User.username.ilike(f"%{search}%") |
                    User.email.ilike(f"%{search}%") |
                    User.full_name.ilike(f"%{search}%")
                )
            if role:
                count_query = count_query.where(User.role == role)
            
            total = await db.scalar(count_query)
            
            return {
                "message": "Successfully retrieved users",
                "data": users,
                "metadata": {
                    "skip": skip,
                    "limit": limit,
                    "total": total
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving users: {str(e)}"
            )

    @staticmethod
    async def get_user(db: AsyncSession, user_id: uuid.UUID) -> User:
        try:
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                raise NotFoundError("User", user_id)
                
            return ResponseHandler.get_single_success("User", user_id, user)
        except NotFoundError:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving user: {str(e)}"
            )

    @staticmethod
    async def create_user(db: AsyncSession, user: UserCreate) -> User:
        try:
            # Check if email already exists
            email_query = select(User).where(User.email == user.email)
            email_result = await db.execute(email_query)
            if email_result.scalar_one_or_none():
                raise ConflictError(f"User with email '{user.email}' already exists")
            
            # Check if username already exists
            username_query = select(User).where(User.username == user.username)
            username_result = await db.execute(username_query)
            if username_result.scalar_one_or_none():
                raise ConflictError(f"User with username '{user.username}' already exists")
            
            # Create user
            user_dict = user.model_dump(exclude={"password"})
            # password = user.password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
            user_dict["hashed_password"] = get_password_hash(user.password)
            
            db_user = User(**user_dict)
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            
            return ResponseHandler.create_success("User", db_user.id, db_user)
        except (ConflictError, ValidationError):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}"
            )

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        user_update: UserUpdate,
        current_user: User
    ) -> User:
        try:
            # Get user to update
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            db_user = result.scalar_one_or_none()
            
            if not db_user:
                raise NotFoundError("User", user_id)
            
            # Check permissions
            if current_user.role != UserRole.ADMIN and current_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update your own profile"
                )
            
            # Check for email conflicts
            if user_update.email and user_update.email != db_user.email:
                email_query = select(User).where(User.email == user_update.email)
                email_result = await db.execute(email_query)
                if email_result.scalar_one_or_none():
                    raise ConflictError(f"User with email '{user_update.email}' already exists")
            
            # Check for username conflicts
            if user_update.username and user_update.username != db_user.username:
                username_query = select(User).where(User.username == user_update.username)
                username_result = await db.execute(username_query)
                if username_result.scalar_one_or_none():
                    raise ConflictError(f"User with username '{user_update.username}' already exists")
            
            # Update fields
            for key, value in user_update.model_dump(exclude_unset=True).items():
                setattr(db_user, key, value)
            
            db_user.updated_at = datetime.utcnow()
            
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            
            return ResponseHandler.update_success("User", user_id, db_user)
        except (NotFoundError, ConflictError, ValidationError, HTTPException):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating user: {str(e)}"
            )

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: uuid.UUID, current_user: User) -> User:
        try:
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                raise NotFoundError("User", user_id)
            
            # Check permissions
            if current_user.role != UserRole.ADMIN and current_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete your own account"
                )
            
            # Prevent admin from deleting themselves
            if current_user.id == user_id and current_user.role == UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Admin cannot delete their own account"
                )
            
            await db.delete(user)
            await db.commit()
            
            return ResponseHandler.delete_success("User", user_id, user)
        except (NotFoundError, HTTPException):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting user: {str(e)}"
            )

    @staticmethod
    async def authenticate_user(db: AsyncSession, login_data: UserLogin) -> Dict[str, Any]:
        try:
            # Find user by username or email
            query = select(User).where(
                (User.username == login_data.username) | (User.email == login_data.username)
            )
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password"
                )
            
            if not verify_password(login_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password"
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is deactivated"
                )
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.add(user)
            await db.commit()
            
            # Create access token
            access_token_expires = timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": Config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": user
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Authentication error: {str(e)}"
            )

    @staticmethod
    async def change_password(
        db: AsyncSession,
        user_id: uuid.UUID,
        password_data: PasswordChange,
        current_user: User
    ) -> Dict[str, Any]:
        try:
            # Get user
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                raise NotFoundError("User", user_id)
            
            # Check permissions
            if current_user.role != UserRole.ADMIN and current_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only change your own password"
                )
            
            # Verify current password
            if not verify_password(password_data.current_password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect"
                )
            
            # Update password
            user.hashed_password = get_password_hash(password_data.new_password)
            user.updated_at = datetime.utcnow()
            
            db.add(user)
            await db.commit()
            
            return {
                "message": "Password changed successfully",
                "data": {"user_id": str(user_id)}
            }
        except (NotFoundError, HTTPException):
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error changing password: {str(e)}"
            )
