# Role-Based Access Control Implementation

## 🔐 Overview

This document outlines the role-based access control (RBAC) implementation across all modules in the e-commerce backend. The system enforces different permission levels based on user roles.

## 👥 User Roles

### 1. Normal User (`normal_user`)
- **Default role** for new registrations
- **Permissions:**
  - View products and categories (public access)
  - Create and manage their own cart (requires authentication)
  - Create and manage their own orders (requires authentication)
  - View and update their own profile
  - Change their own password

### 2. Seller (`seller`)
- **All normal user permissions** plus:
  - Create, update, and delete products
  - View all orders
  - Update order status
  - View seller list

### 3. Admin (`admin`)
- **All seller permissions** plus:
  - Manage all users (create, update, delete)
  - Create, update, and delete categories
  - Update payment status
  - View all orders for any user
  - Manage user roles

## 🛡️ Access Control Implementation

### Authentication Requirements

| Module | Endpoint | Authentication Required | Role Required |
|--------|----------|------------------------|---------------|
| **Products** | GET /products | ❌ | - |
| **Products** | GET /products/{id} | ❌ | - |
| **Products** | POST /products | ✅ | Seller/Admin |
| **Products** | PUT /products/{id} | ✅ | Seller/Admin |
| **Products** | DELETE /products/{id} | ✅ | Seller/Admin |
| **Categories** | GET /categories | ❌ | - |
| **Categories** | GET /categories/{id} | ❌ | - |
| **Categories** | POST /categories | ✅ | Admin |
| **Categories** | PUT /categories/{id} | ✅ | Admin |
| **Categories** | DELETE /categories/{id} | ✅ | Admin |
| **Cart** | POST /carts | ✅ | Any authenticated user |
| **Cart** | GET /carts/{id} | ✅ | Any authenticated user |
| **Cart** | DELETE /carts/{id} | ✅ | Any authenticated user |
| **Cart** | POST /carts/{id}/items | ✅ | Any authenticated user |
| **Cart** | PUT /carts/{id}/items/{item_id} | ✅ | Any authenticated user |
| **Cart** | DELETE /carts/{id}/items/{item_id} | ✅ | Any authenticated user |
| **Orders** | GET /orders/my-orders | ✅ | Any authenticated user |
| **Orders** | GET /orders/ | ✅ | Seller/Admin |
| **Orders** | GET /orders/user/{user_id} | ✅ | Admin |
| **Orders** | GET /orders/{id} | ✅ | Owner/Seller/Admin |
| **Orders** | POST /orders | ✅ | Any authenticated user |
| **Orders** | PUT /orders/{id} | ✅ | Owner/Seller/Admin |
| **Orders** | POST /orders/{id}/cancel | ✅ | Owner |
| **Orders** | PUT /orders/{id}/status | ✅ | Seller/Admin |
| **Orders** | PUT /orders/{id}/payment-status | ✅ | Admin |
| **Users** | GET /users/ | ✅ | Admin |
| **Users** | GET /users/me | ✅ | Any authenticated user |
| **Users** | GET /users/{id} | ✅ | Owner/Admin |
| **Users** | POST /users/ | ✅ | Admin |
| **Users** | PUT /users/{id} | ✅ | Owner/Admin |
| **Users** | DELETE /users/{id} | ✅ | Owner/Admin |
| **Users** | POST /users/change-password | ✅ | Owner |
| **Users** | GET /users/sellers/list | ✅ | Seller/Admin |

## 🔧 Implementation Details

### 1. Authentication Middleware
- **JWT Token Validation**: All protected endpoints validate JWT tokens
- **User Context**: Current user information is injected into route handlers
- **Token Expiration**: Tokens expire after 30 minutes (configurable)

### 2. Authorization Decorators
```python
# Require any authenticated user
@router.get("/protected")
async def protected_endpoint(current_user: User = Depends(get_current_active_user)):
    pass

# Require admin role
@router.post("/admin-only")
async def admin_endpoint(current_user: User = Depends(require_admin)):
    pass

# Require seller or admin role
@router.put("/seller-admin")
async def seller_admin_endpoint(current_user: User = Depends(require_seller_or_admin)):
    pass
```

### 3. Service Layer Authorization
- **Role Checks**: Services validate user roles before performing operations
- **Ownership Validation**: Users can only access their own resources (unless admin)
- **Permission Errors**: Proper HTTP 403 Forbidden responses for unauthorized access

### 4. Database-Level Security
- **User Association**: Orders and carts are associated with users
- **Soft Constraints**: Business logic enforces access control
- **Audit Trail**: All operations are logged with user context

## 🚨 Security Features

### 1. Input Validation
- **Pydantic Schemas**: All input data is validated
- **Type Safety**: Strong typing prevents injection attacks
- **Field Validation**: Length limits, format validation, etc.

### 2. Error Handling
- **Consistent Responses**: Standardized error response format
- **Information Disclosure**: No sensitive information in error messages
- **Logging**: All security events are logged

### 3. Rate Limiting (Recommended)
- **API Rate Limits**: Prevent brute force attacks
- **User Rate Limits**: Prevent abuse by individual users
- **IP-based Limits**: Prevent distributed attacks

## 📋 Permission Matrix

| Action | Normal User | Seller | Admin |
|--------|-------------|--------|-------|
| **View Products** | ✅ | ✅ | ✅ |
| **Create Products** | ❌ | ✅ | ✅ |
| **Update Products** | ❌ | ✅ | ✅ |
| **Delete Products** | ❌ | ✅ | ✅ |
| **View Categories** | ✅ | ✅ | ✅ |
| **Create Categories** | ❌ | ❌ | ✅ |
| **Update Categories** | ❌ | ❌ | ✅ |
| **Delete Categories** | ❌ | ❌ | ✅ |
| **Manage Cart** | ✅ | ✅ | ✅ |
| **Create Orders** | ✅ | ✅ | ✅ |
| **View Own Orders** | ✅ | ✅ | ✅ |
| **View All Orders** | ❌ | ✅ | ✅ |
| **Update Order Status** | ❌ | ✅ | ✅ |
| **Update Payment Status** | ❌ | ❌ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ |
| **Change User Roles** | ❌ | ❌ | ✅ |

## 🔄 Workflow Examples

### 1. Product Management (Seller)
```python
# 1. Seller logs in and gets JWT token
POST /auth/login
# 2. Seller creates a product
POST /products (with Bearer token)
# 3. Seller updates product stock
PUT /products/{id} (with Bearer token)
```

### 2. Order Processing (Admin)
```python
# 1. Admin logs in
POST /auth/login
# 2. Admin views all orders
GET /orders (with Bearer token)
# 3. Admin updates payment status
PUT /orders/{id}/payment-status (with Bearer token)
```

### 3. Customer Shopping (Normal User)
```python
# 1. User registers
POST /auth/register
# 2. User logs in
POST /auth/login
# 3. User adds items to cart
POST /carts/{id}/items (with Bearer token)
# 4. User creates order
POST /orders (with Bearer token)
```

## 🛠️ Configuration

### Environment Variables
```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

### Role Assignment
- **Default Role**: New users get `normal_user` role
- **Role Promotion**: Only admins can change user roles
- **Role Validation**: All role changes are logged

## 📊 Monitoring & Auditing

### 1. Access Logs
- **User Actions**: All authenticated actions are logged
- **Failed Attempts**: Unauthorized access attempts are tracked
- **Role Changes**: All role modifications are audited

### 2. Security Metrics
- **Login Attempts**: Track successful/failed logins
- **Permission Denials**: Monitor 403 responses
- **Token Usage**: Track token generation and validation

### 3. Alerts
- **Suspicious Activity**: Multiple failed login attempts
- **Privilege Escalation**: Unauthorized role changes
- **Data Access**: Unusual access patterns

## 🔮 Future Enhancements

### 1. Fine-Grained Permissions
- **Resource-Level Access**: Control access to specific products/categories
- **Action Permissions**: Separate read/write/delete permissions
- **Time-Based Access**: Temporary permissions with expiration

### 2. Multi-Tenant Support
- **Organization Roles**: Roles within organizations
- **Cross-Organization Access**: Controlled access between organizations
- **Hierarchical Permissions**: Nested permission structures

### 3. Advanced Security
- **Two-Factor Authentication**: Additional security layer
- **Session Management**: Advanced session handling
- **API Key Management**: Alternative authentication methods
