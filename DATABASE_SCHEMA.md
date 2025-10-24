# Database Schema - Artisans Alley

## Overview
This document describes the improved database schema with proper relationships designed for clarity and ease of use.

## Core Principles
1. **One User = One Cart** - Each user has exactly ONE shopping cart (one-to-one relationship)
2. **Cart Auto-Created** - Cart is automatically created when user signs up
3. **Simple Access** - Use `/carts/me` to access your cart - no need to track cart IDs
4. **Clear Relationships** - All foreign keys and relationships are properly defined

---

## Tables & Relationships

### 1. Users Table
**Purpose**: Central table for all users (buyers, sellers, admins)

**Key Fields**:
- `id` (UUID, Primary Key)
- `email` (unique)
- `username` (unique)
- `role` (normal_user, seller, admin)
- Location fields (latitude, longitude, city, state, country)
- Notification preferences

**Relationships**:
- **ONE-to-ONE** with `Cart` - Each user has exactly one cart
- **ONE-to-MANY** with `Order` - Each user can have many orders
- **ONE-to-MANY** with `Product` - Each seller can have many products (if role=seller)

---

### 2. Cart Table
**Purpose**: Shopping cart for each user (persistent across sessions)

**Key Fields**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, **UNIQUE**)
- `total_price` (calculated sum of cart items)
- `created_at`, `updated_at`

**Relationships**:
- **ONE-to-ONE** with `User` - Each cart belongs to exactly one user
- **ONE-to-MANY** with `CartItem` - One cart contains many items

**Important Notes**:
- Cart is auto-created during user signup
- `user_id` is UNIQUE - enforces one cart per user
- Use `GET /carts/me` to fetch your cart
- No need to store cart_id in localStorage anymore!

---

### 3. CartItem Table  
**Purpose**: Individual items in a cart (product + quantity)

**Key Fields**:
- `id` (UUID, Primary Key)
- `cart_id` (UUID, Foreign Key → carts.id)
- `product_id` (UUID, Foreign Key → products.id)
- `quantity` (integer, minimum 1)
- `subtotal_price` (price × quantity)
- `added_at` (timestamp)

**Relationships**:
- **MANY-to-ONE** with `Cart` - Many items belong to one cart
- **MANY-to-ONE** with `Product` - Many cart items can reference one product

**Cascade Delete**: When cart is deleted, all cart items are deleted

---

### 4. Product Table
**Purpose**: Products available for purchase

**Key Fields**:
- `id` (UUID, Primary Key)
- `title`, `description`, `price`
- `seller_id` (UUID, Foreign Key → users.id)
- `category_id` (UUID, Foreign Key → categories.id)
- `stock`, `rating`, `brand`
- `thumbnail`, `images[]`

**Relationships**:
- **MANY-to-ONE** with `User` (seller) - Many products belong to one seller
- **MANY-to-ONE** with `Category` - Many products belong to one category
- **ONE-to-MANY** with `CartItem` - One product can be in many carts
- **ONE-to-MANY** with `OrderItem` - One product can be in many orders

---

### 5. Category Table
**Purpose**: Product categories

**Key Fields**:
- `id` (UUID, Primary Key)
- `name` (unique)
- `description`

**Relationships**:
- **ONE-to-MANY** with `Product` - One category has many products

---

### 6. Order Table
**Purpose**: Completed purchases (created when cart is checked out)

**Key Fields**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `total_amount`
- `status` (pending, processing, shipped, delivered, cancelled)
- `shipping_address`

**Relationships**:
- **MANY-to-ONE** with `User` - Many orders belong to one user
- **ONE-to-MANY** with `OrderItem` - One order contains many items
- **ONE-to-ONE** with `Payment` - Each order has one payment

---

### 7. OrderItem Table
**Purpose**: Products in a completed order

**Key Fields**:
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → orders.id)
- `product_id` (UUID, Foreign Key → products.id)
- `quantity`
- `price_at_purchase` (price snapshot)
- `subtotal`

**Relationships**:
- **MANY-to-ONE** with `Order`
- **MANY-to-ONE** with `Product`

---

### 8. Payment Table
**Purpose**: Payment information for orders

**Key Fields**:
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → orders.id)
- `user_id` (UUID, Foreign Key → users.id)
- `payment_method` (credit_card, debit_card, paypal, etc.)
- `payment_provider` (stripe, paypal, manual)
- `amount`, `status`

**Relationships**:
- **ONE-to-ONE** with `Order`
- **MANY-to-ONE** with `User`

---

## API Endpoints (Simplified)

### Cart Endpoints
```
GET    /carts/me              # Get YOUR cart (recommended)
POST   /carts/me/items        # Add item to YOUR cart (recommended)
GET    /carts/{cart_id}       # Get specific cart (legacy)
POST   /carts/{cart_id}/items # Add to specific cart (legacy)
PUT    /carts/{cart_id}/items/{item_id}  # Update item quantity
DELETE /carts/{cart_id}/items/{item_id}  # Remove item
```

### Usage Example
```javascript
// OLD WAY (complicated):
// 1. Get/create cart
// 2. Store cart ID in localStorage
// 3. Use cart ID to add items
const cartId = localStorage.getItem('cartId');
await fetch(`/carts/${cartId}/items`, {...});

// NEW WAY (simple):
// Just add to "my" cart - backend knows who you are!
await fetch('/carts/me/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 'product-uuid-here',
    quantity: 1
  })
});
```

---

## Database Diagram

```
┌─────────────────┐
│     USERS       │
│  (id, email,    │
│   username)     │
└────┬───┬───┬────┘
     │   │   │
     │   │   └─────────────────────┐
     │   │                         │
     │   └───────────┐             │
     │               │             │
     │          ┌────▼────────┐    │
     │          │  PRODUCTS   │    │
     │          │ (seller_id) │    │
     │          └──────┬──────┘    │
     │                 │           │
┌────▼─────┐   ┌───────▼────────┐ │
│  CART    │   │  CART_ITEMS    │ │
│(user_id) │◄──┤ (cart_id,      │ │
└────┬─────┘   │  product_id)   │ │
     │         └────────────────┘ │
     │                             │
┌────▼─────┐   ┌────────────────┐ │
│  ORDERS  │   │  ORDER_ITEMS   │ │
│(user_id) │◄──┤ (order_id,     │ │
└────┬─────┘   │  product_id)   │ │
     │         └────────────────┘ │
     │                             │
┌────▼─────┐                      │
│ PAYMENT  │◄─────────────────────┘
│(user_id, │
│ order_id)│
└──────────┘
```

---

## Key Improvements

### 1. **Simplified Cart Access**
- No more tracking cart IDs
- No more localStorage.setItem('cartId', ...)
- Just use `/carts/me` - the backend knows your cart!

### 2. **Automatic Cart Creation**
- Cart is created automatically during user signup
- Users don't need to manually create carts
- One cart per user, always

### 3. **Clear Relationships**
- All foreign keys properly defined
- Cascade deletes where appropriate
- No orphaned records

### 4. **Better Data Integrity**
- UNIQUE constraint on `carts.user_id` prevents duplicate carts
- Foreign key constraints prevent invalid references
- Indexed columns for faster queries

---

## Migration Notes

**All tables have been recreated with proper relationships.**

**Frontend Changes:**
- Use `GET /carts/me` instead of managing cart IDs
- Use `POST /carts/me/items` to add items
- Remove all localStorage cart ID management

**Backend Changes:**
- Cart is auto-created in user signup service
- New `get_my_cart()` method
- Deprecated old cart creation endpoints (they now just return your cart)

---

## Summary

The new schema is designed around this simple principle:

**Every user has ONE cart. To access it, just ask for "my cart". That's it!**

No more complicated cart ID management, no more localStorage tracking, just simple, logical relationships that make sense.

