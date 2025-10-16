# Location-Based Product Filtering & Seller Authorization Features

## 🎉 New Features Implemented

Two major features have been added to the Artisans Alley platform:

1. **Seller Product Ownership Authorization** - Only the seller who created a product or an admin can update/delete it
2. **Location-Based Product Filtering** - Products are filtered and sorted based on user's proximity to sellers

---

## Feature 1: Seller Product Ownership & Authorization

### Overview
Each product is now associated with the seller who created it. Only the product owner or an admin can update or delete the product.

### Database Changes
- Added `seller_id` field to `Product` model
- Foreign key relationship to `User` model
- Indexed for faster queries

### Authorization Rules

#### Product Creation
- ✅ **Sellers** can create products
- ✅ **Admins** can create products  
- ❌ **Normal users** cannot create products
- Auto-assigns `seller_id` to the creator

#### Product Update/Delete
- ✅ **Product Owner** can update/delete their own products
- ✅ **Admins** can update/delete any product
- ❌ **Other sellers** cannot update/delete products they didn't create
- ❌ **Normal users** cannot update/delete products

### API Behavior

```python
# When a seller creates a product
POST /products/
# seller_id is automatically set to current_user.id

# When updating a product
PUT /products/{product_id}
# Checks: current_user.id == product.seller_id OR current_user.role == ADMIN

# When deleting a product
DELETE /products/{product_id}
# Checks: current_user.id == product.seller_id OR current_user.role == ADMIN
```

###Error Responses

**Unauthorized Update/Delete Attempt:**
```json
{
  "detail": "You can only update products that you created. Only the product owner or admin can update this product."
}
```
Status Code: `403 Forbidden`

---

## Feature 2: Location-Based Product Filtering

### Overview
Users can now see products from sellers near their location. Products can be sorted by distance and filtered within a specific radius.

### Database Changes

#### User Model
Added location fields:
- `latitude` (Float, nullable)
- `longitude` (Float, nullable)
- `city` (String, nullable)
- `state` (String, nullable)
- `country` (String, nullable)

### How It Works

1. **Distance Calculation**: Uses Haversine formula to calculate distance between user and seller
2. **Sorting**: Products can be sorted by proximity to user
3. **Filtering**: Products can be filtered within a specified radius (e.g., 50km)
4. **Fallback**: If location data is missing, products are sorted by creation date

### API Endpoints

#### Get Products with Location Filtering

```http
GET /products/?user_lat=40.7128&user_lon=-74.0060&sort_by_distance=true&max_distance_km=50
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search term for title/description/brand |
| `user_lat` | float | No | User's latitude |
| `user_lon` | float | No | User's longitude |
| `max_distance_km` | float | No | Maximum distance in kilometers |
| `sort_by_distance` | boolean | No | Sort by distance (default: false) |

### Response Format

```json
{
  "message": "Successfully retrieved products for page 1",
  "data": [
    {
      "id": "uuid",
      "title": "Handmade Ceramic Mug",
      "description": "Beautiful handcrafted mug",
      "price": 25.99,
      "discount_percentage": 10.0,
      "rating": 4.5,
      "stock": 15,
      "brand": "Artisan Ceramics",
      "thumbnail": "url",
      "images": ["url1", "url2"],
      "category_id": "uuid",
      "seller_id": "uuid",
      "created_at": "2025-10-15T00:00:00",
      "updated_at": null,
      "distance_km": 5.2,
      "distance_formatted": "5.2 km",
      "seller_location": {
        "city": "New York",
        "state": "NY"
      }
    }
  ],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "sorted_by_distance": true,
    "max_distance_km": 50
  }
}
```

### Distance Formatting

- **< 1 km**: Shows in meters (e.g., "850 meters")
- **1-10 km**: Shows with decimal (e.g., "5.2 km")
- **> 10 km**: Shows as integer (e.g., "25 km")
- **No location data**: Shows "Distance unavailable"

### Use Cases

#### 1. Show Nearby Products
```javascript
// Get products within 25km of user's location
const response = await fetch(
  `/products/?user_lat=40.7128&user_lon=-74.0060&max_distance_km=25&sort_by_distance=true`
);
```

#### 2. Show All Products Sorted by Distance
```javascript
// Get all products sorted by proximity
const response = await fetch(
  `/products/?user_lat=40.7128&user_lon=-74.0060&sort_by_distance=true`
);
```

#### 3. Search Nearby Products
```javascript
// Search for "ceramic" products within 50km
const response = await fetch(
  `/products/?search=ceramic&user_lat=40.7128&user_lon=-74.0060&max_distance_km=50`
);
```

#### 4. Normal Product Listing (No Location)
```javascript
// Get products without location filtering
const response = await fetch(`/products/`);
// Products sorted by creation date (newest first)
```

---

## Technical Implementation

### Location Utility Service

Created `src/common/location_utils.py` with:

```python
class LocationUtils:
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two points in kilometers"""
        # Implementation using Haversine formula
        
    @staticmethod
    def calculate_distance(user_lat, user_lon, seller_lat, seller_lon):
        """Calculate distance with null checking"""
        
    @staticmethod
    def is_within_radius(distance, max_distance_km):
        """Check if distance is within radius"""
        
    @staticmethod
    def format_distance(distance):
        """Format distance for display"""
```

### Product Service Updates

- Modified `get_all_products()` to accept location parameters
- Joins `Product` with `User` (seller) table to get seller location
- Calculates distance for each product
- Filters by `max_distance_km` if specified
- Sorts by distance or creation date
- Returns formatted product data with distance info

---

## Migration Details

**Migration ID**: `abbd00ed0725`  
**Description**: Add location fields and seller tracking

### What Changed:

1. **Users Table**:
   - Added `latitude`, `longitude`, `city`, `state`, `country` columns
   - All nullable (optional)

2. **Products Table**:
   - Added `seller_id` column (UUID, NOT NULL)
   - Foreign key to `users.id`
   - Index on `seller_id`
   - Existing products assigned to first user in database

3. **Email Verification Tokens Table**:
   - Added unique constraint on `id`

---

## Frontend Integration

### Update User Profile with Location

```javascript
// When user updates their profile, include location
const updateProfile = async (userData) => {
  const response = await api.put(`/users/${userId}`, {
    ...userData,
    latitude: 40.7128,
    longitude: -74.0060,
    city: "New York",
    state: "NY",
    country: "USA"
  });
};
```

### Get User's Location

```javascript
// Use browser Geolocation API
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => reject(error)
    );
  });
};

// Use in product fetching
const fetchNearbyProducts = async () => {
  try {
    const location = await getUserLocation();
    const response = await api.get('/products/', {
      params: {
        user_lat: location.latitude,
        user_lon: location.longitude,
        sort_by_distance: true,
        max_distance_km: 50
      }
    });
    return response.data;
  } catch (error) {
    // Fallback to normal product listing
    const response = await api.get('/products/');
    return response.data;
  }
};
```

### Display Distance

```jsx
// In ProductCard component
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.thumbnail} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
      
      {product.distance_formatted && (
        <p className="distance">
          📍 {product.distance_formatted} away
        </p>
      )}
      
      {product.seller_location.city && (
        <p className="seller-location">
          From {product.seller_location.city}, {product.seller_location.state}
        </p>
      )}
    </div>
  );
}
```

### Filter by Distance

```jsx
// Add distance filter to product page
function ProductsPage() {
  const [maxDistance, setMaxDistance] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    getUserLocation().then(setUserLocation).catch(() => null);
  }, []);
  
  const fetchProducts = async () => {
    const params = {
      page: currentPage,
      limit: 10
    };
    
    if (userLocation && sortByDistance) {
      params.user_lat = userLocation.latitude;
      params.user_lon = userLocation.longitude;
      params.sort_by_distance = true;
    }
    
    if (maxDistance) {
      params.max_distance_km = maxDistance;
    }
    
    const response = await api.get('/products/', { params });
    setProducts(response.data.data);
  };
  
  return (
    <div>
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={sortByDistance}
            onChange={(e) => setSortByDistance(e.target.checked)}
          />
          Sort by distance
        </label>
        
        <select value={maxDistance || ""} onChange={(e) => setMaxDistance(e.target.value || null)}>
          <option value="">All distances</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
        </select>
      </div>
      
      <div className="products">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### Test Authorization

```bash
# Create a product as seller1
curl -X POST http://localhost:8000/products/ \
  -H "Authorization: Bearer seller1_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test",
    "price": 10.00,
    "discount_percentage": 0,
    "rating": 5.0,
    "stock": 10,
    "brand": "Test Brand",
    "thumbnail": "url",
    "images": ["url"],
    "category_id": "category_uuid"
  }'

# Try to update as seller2 (should fail)
curl -X PUT http://localhost:8000/products/{product_id} \
  -H "Authorization: Bearer seller2_token" \
  -H "Content-Type: application/json" \
  -d '{"price": 15.00}'

# Expected: 403 Forbidden

# Try to update as admin (should succeed)
curl -X PUT http://localhost:8000/products/{product_id} \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"price": 15.00}'

# Expected: 200 OK
```

### Test Location Filtering

```bash
# Get products sorted by distance
curl "http://localhost:8000/products/?user_lat=40.7128&user_lon=-74.0060&sort_by_distance=true"

# Get products within 50km
curl "http://localhost:8000/products/?user_lat=40.7128&user_lon=-74.0060&max_distance_km=50"

# Search nearby products
curl "http://localhost:8000/products/?search=ceramic&user_lat=40.7128&user_lon=-74.0060&sort_by_distance=true"
```

---

## Security Considerations

1. **Authorization**: Product ownership is enforced at the service layer
2. **Location Privacy**: User location is optional and never shared publicly
3. **Distance Accuracy**: Haversine formula provides approximate distances (±0.5% error)
4. **Performance**: Seller location joins are optimized with indexes

---

## Performance Notes

1. **Database Joins**: Product and User tables joined for seller location
2. **In-Memory Sorting**: Distance calculation done in Python (acceptable for current scale)
3. **Future Optimization**: Consider PostgreSQL PostGIS extension for large-scale deployments
4. **Indexes**: Added index on `products.seller_id` for faster joins

---

## Files Modified/Created

### New Files:
- `backend/src/common/location_utils.py` - Location calculation utilities
- `backend/alembic/versions/abbd00ed0725_*.py` - Database migration
- `LOCATION_AND_SELLER_FEATURES.md` - This documentation

### Modified Files:
- `backend/src/auth/user/models.py` - Added location fields
- `backend/src/auth/user/schema.py` - Updated schemas with location fields
- `backend/src/product/models.py` - Added seller_id field
- `backend/src/product/service.py` - Added authorization and location filtering
- `backend/src/product/routes.py` - Updated endpoints with location parameters

---

## Future Enhancements

1. **Seller Ratings**: Track seller ratings and reviews
2. **Delivery Zones**: Define delivery zones based on location
3. **Shipping Cost Calculation**: Calculate shipping based on distance
4. **Geo-fencing**: Automatically detect user location
5. **Map View**: Show products on a map interface
6. **Location History**: Track user's location history for better recommendations
7. **Batch Distance Calculation**: Use database functions for better performance

---

## Troubleshooting

### Products Not Showing Distance
- Ensure seller has location data (latitude/longitude)
- Ensure user_lat and user_lon are provided in request
- Check that seller's location fields are not null

### Authorization Errors
- Verify user role (must be SELLER or ADMIN to create products)
- Check token authentication
- Ensure user is the product owner or admin for updates/deletes

### Distance Calculation Issues
- Verify coordinates are in decimal degrees
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Check for null values in location fields

---

## Summary

✅ **Seller Product Ownership**: Only creators and admins can modify products  
✅ **Location-Based Filtering**: Products sorted by proximity to user  
✅ **Distance Calculation**: Accurate Haversine formula implementation  
✅ **Flexible API**: Multiple filtering and sorting options  
✅ **Privacy-Focused**: Optional location data  
✅ **Well-Documented**: Comprehensive API documentation  
✅ **Database Migration**: Successfully applied  

**Status**: ✅ Ready for Production

**Version**: 2.0  
**Implementation Date**: October 15, 2025

