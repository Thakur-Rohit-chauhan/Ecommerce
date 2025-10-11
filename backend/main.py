from fastapi import FastAPI
from src.product.routes import router as product_router
from contextlib import asynccontextmanager
from src.db.main import init_db
from src.db.auto_migrations import run_auto_migrations
from src.cart.routes import router as cart_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Server is starting...")
    await init_db()
    await run_auto_migrations()
    yield
    print("🧹 Server is shutting down...")



description = """
Welcome to the E-commerce API! 🚀

This API provides a comprehensive set of functionalities for managing your e-commerce platform.

Key features include:

- **Crud**
	- Create, Read, Update, and Delete endpoints.
- **Search**
	- Find specific information with parameters and pagination.
- **Auth**
	- Verify user/system identity.
	- Secure with Access and Refresh tokens.
- **Permission**
	- Assign roles with specific permissions.
	- Different access levels for User/Admin.
- **Validation**
	- Ensure accurate and secure input data.


For any inquiries, please contact:

* Github: https://github.com/Thakur-Rohit-chauhan
"""

version = "1.0.0"

app = FastAPI(
    title="E-commerce API",
    description=description,
    version=version,
    contact={
        "name": "Rohit Chauhan",
        "url": "https://github.com/Thakur-Rohit-chauhan",
    },
    swagger_ui_parameters={
        "syntaxHighlight.theme": "monokai",
        "layout": "BaseLayout",
        "filter": True,
        "tryItOutEnabled": True,
        "onComplete": "Ok"
    },
    lifespan=lifespan
)

app.include_router(product_router, prefix="/products", tags=["Products"])
app.include_router(cart_router, prefix="/carts", tags=["Carts"])