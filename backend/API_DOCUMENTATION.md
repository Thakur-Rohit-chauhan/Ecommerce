# API Documentation

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "password": "securepassword123",
  "phone_number": "+1234567890",
  "address": "123 Main St, City, State",
  "role": "normal_user"  // optional: normal_user, seller, admin
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",  // or email
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

## 👥 User Management

### User Endpoints

#### Get All Users (Admin Only)
```http
GET /users?skip=0&limit=100&search=john&role=normal_user
Authorization: Bearer <admin_token>
```

#### Get User Profile
```http
GET /users/{user_id}
Authorization: Bearer <token>
```

#### Update User
```http
PUT /users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "full_name": "John Updated",
  "phone_number": "+0987654321"
}
```

#### Change Password
```http
POST /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

#### Get Sellers (Seller/Admin Only)
```http
GET /users/sellers/list?skip=0&limit=100&search=seller
Authorization: Bearer <seller_or_admin_token>
```

## 🛍️ Products

### Product Endpoints

#### Get All Products
```http
GET /products?page=1&limit=10&search=laptop
```

#### Get Product by ID
```http
GET /products/{product_id}
```

#### Create Product (Seller/Admin Only)
```http
POST /products
Authorization: Bearer <seller_or_admin_token>
Content-Type: application/json

{
  "title": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "discount_percentage": 10.0,
  "rating": 4.5,
  "stock": 50,
  "brand": "TechBrand",
  "thumbnail": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "category_id": "category-uuid"
}
```

#### Update Product (Seller/Admin Only)
```http
PUT /products/{product_id}
Authorization: Bearer <seller_or_admin_token>
Content-Type: application/json

{
  "price": 1199.99,
  "stock": 45
}
```

#### Delete Product (Seller/Admin Only)
```http
DELETE /products/{product_id}
Authorization: Bearer <seller_or_admin_token>
```

## 📦 Categories

### Category Endpoints

#### Get All Categories
```http
GET /categories?skip=0&limit=100&search=electronics
```

#### Get Category by ID
```http
GET /categories/{category_id}
```

#### Create Category (Admin Only)
```http
POST /categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

#### Update Category (Admin Only)
```http
PUT /categories/{category_id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Electronics & Gadgets",
  "description": "Updated description"
}
```

#### Delete Category (Admin Only)
```http
DELETE /categories/{category_id}
Authorization: Bearer <admin_token>
```

## 🛒 Cart

### Cart Endpoints

#### Create Cart (Requires Authentication)
```http
POST /carts
Authorization: Bearer <token>
Content-Type: application/json

{
  "total_price": 0.0
}
```

#### Get Cart (Requires Authentication)
```http
GET /carts/{cart_id}
Authorization: Bearer <token>
```

#### Add Item to Cart (Requires Authentication)
```http
POST /carts/{cart_id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "product-uuid",
  "quantity": 2
}
```

#### Update Cart Item (Requires Authentication)
```http
PUT /carts/{cart_id}/items/{item_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Cart Item (Requires Authentication)
```http
DELETE /carts/{cart_id}/items/{item_id}
Authorization: Bearer <token>
```

#### Delete Cart (Requires Authentication)
```http
DELETE /carts/{cart_id}
Authorization: Bearer <token>
```

## 📋 Orders

### Order Endpoints

#### Get My Orders
```http
GET /orders/my-orders?skip=0&limit=100&status=pending&payment_status=paid
Authorization: Bearer <token>
```

#### Get All Orders (Seller/Admin Only)
```http
GET /orders?skip=0&limit=100&status=shipped&payment_status=paid
Authorization: Bearer <seller_or_admin_token>
```

#### Get User Orders (Admin Only)
```http
GET /orders/user/{user_id}?skip=0&limit=100
Authorization: Bearer <admin_token>
```

#### Get Order by ID
```http
GET /orders/{order_id}
Authorization: Bearer <token>
```

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipping_address": "123 Main St, City, State, 12345",
  "billing_address": "123 Main St, City, State, 12345",
  "shipping_notes": "Leave at front door",
  "order_items": [
    {
      "product_id": "product-uuid",
      "quantity": 2
    }
  ]
}
```

#### Update Order
```http
PUT /orders/{order_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipping_address": "456 New St, City, State, 12345",
  "shipping_notes": "Ring doorbell"
}
```

#### Cancel Order
```http
POST /orders/{order_id}/cancel
Authorization: Bearer <token>
```

#### Update Order Status (Seller/Admin Only)
```http
PUT /orders/{order_id}/status?status=shipped
Authorization: Bearer <seller_or_admin_token>
```

#### Update Payment Status (Admin Only)
```http
PUT /orders/{order_id}/payment-status?payment_status=paid
Authorization: Bearer <admin_token>
```

## 🔑 Role-Based Access Control

### User Roles

1. **Normal User** (`normal_user`)
   - Can view products and categories
   - Can manage their own cart
   - Can create and manage their own orders
   - Can view and update their own profile

2. **Seller** (`seller`)
   - All normal user permissions
   - Can create, update, and delete products
   - Can view all orders
   - Can update order status
   - Can view seller list

3. **Admin** (`admin`)
   - All seller permissions
   - Can manage all users
   - Can create, update, and delete categories
   - Can update payment status
   - Can view all orders for any user
   - Can manage user roles

### Permission Matrix

| Endpoint | Normal User | Seller | Admin |
|----------|-------------|--------|-------|
| View Products | ✅ | ✅ | ✅ |
| Create/Update/Delete Products | ❌ | ✅ | ✅ |
| View Categories | ✅ | ✅ | ✅ |
| Create/Update/Delete Categories | ❌ | ❌ | ✅ |
| Manage Cart | ✅ | ✅ | ✅ |
| Create Orders | ✅ | ✅ | ✅ |
| View Own Orders | ✅ | ✅ | ✅ |
| View All Orders | ❌ | ✅ | ✅ |
| Update Order Status | ❌ | ✅ | ✅ |
| Update Payment Status | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Change User Roles | ❌ | ❌ | ✅ |

## 📊 Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": { ... },
  "metadata": {
    "skip": 0,
    "limit": 100,
    "total": 50
  }
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

### Authentication Error
```json
{
  "detail": "Could not validate credentials",
  "headers": {
    "WWW-Authenticate": "Bearer"
  }
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Security headers
- Request logging
- Input validation
- SQL injection protection

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error
