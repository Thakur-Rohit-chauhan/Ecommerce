# Dashboard & Invoice Generator Features

## 🎉 New Features Implemented

Two major features have been added to the Artisans Alley platform:

1. **📊 Dashboard Analytics** - Comprehensive dashboards for sellers and admins
2. **🧾 Invoice Generator** - Automated invoice creation and PDF generation

---

## Feature 1: Dashboard Analytics

### Overview
Real-time analytics dashboards provide insights into business performance for both sellers and admins.

### Seller Dashboard

**Endpoint**: `GET /dashboard/seller`

**Features:**
- **Business Metrics**: Total products, orders, revenue, pending orders
- **Recent Orders**: Last 10 orders with customer details
- **Top Products**: Best-selling products by quantity and revenue
- **Revenue Trends**: Daily revenue for the last 30 days
- **Order Status Breakdown**: Distribution of order statuses
- **Payment Status Breakdown**: Distribution of payment statuses

**Sample Response:**
```json
{
  "message": "Dashboard data retrieved successfully",
  "data": {
    "total_products": 25,
    "total_orders": 150,
    "total_revenue": 12500.00,
    "pending_orders": 12,
    "recent_orders": [
      {
        "id": "uuid",
        "order_number": "ORD-20251016-ABC123",
        "status": "confirmed",
        "payment_status": "paid",
        "total_amount": 125.50,
        "created_at": "2025-10-16T10:30:00",
        "customer_name": "John Doe"
      }
    ],
    "top_products": [
      {
        "id": "uuid",
        "title": "Handmade Ceramic Mug",
        "total_sold": 45,
        "total_revenue": 1125.00
      }
    ],
    "revenue_by_day": [
      {
        "date": "2025-10-15",
        "revenue": 450.00
      }
    ],
    "order_status_breakdown": {
      "pending": 5,
      "confirmed": 15,
      "processing": 8,
      "shipped": 25,
      "delivered": 95,
      "cancelled": 2
    },
    "payment_status_breakdown": {
      "pending": 3,
      "paid": 140,
      "failed": 2,
      "refunded": 5
    }
  }
}
```

### Admin Dashboard

**Endpoint**: `GET /dashboard/admin`

**Features:**
- **Platform Metrics**: Total users, sellers, products, orders, revenue
- **Recent Orders**: Last 10 orders across all sellers
- **Top Sellers**: Best-performing sellers by revenue and orders
- **Revenue Trends**: Daily platform revenue
- **User Growth**: Daily user registration trends
- **Order & Payment Status Breakdown**: Platform-wide statistics

**Sample Response:**
```json
{
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "total_users": 1250,
    "total_sellers": 85,
    "total_products": 1200,
    "total_orders": 2500,
    "total_revenue": 125000.00,
    "recent_orders": [...],
    "top_sellers": [
      {
        "id": "uuid",
        "name": "Artisan Crafts Co.",
        "total_revenue": 15000.00,
        "total_orders": 200
      }
    ],
    "revenue_by_day": [...],
    "user_growth_by_day": [...],
    "order_status_breakdown": {...},
    "payment_status_breakdown": {...}
  }
}
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | int | 30 | Number of days for analytics (1-365) |

---

## Feature 2: Invoice Generator

### Overview
Automated invoice generation system that creates professional PDF invoices from orders.

### Invoice Model

**Database Tables:**
- `invoices` - Main invoice information
- `invoice_items` - Individual line items

**Invoice Status:**
- `DRAFT` - Invoice created but not sent
- `SENT` - Invoice sent to customer
- `PAID` - Invoice paid by customer
- `OVERDUE` - Invoice past due date
- `CANCELLED` - Invoice cancelled

### API Endpoints

#### 1. Create Invoice from Order

**Endpoint**: `POST /dashboard/invoices`

**Request:**
```json
{
  "order_id": "uuid",
  "due_days": 30
}
```

**Response:**
```json
{
  "message": "Invoice created successfully",
  "data": {
    "id": "uuid",
    "invoice_number": "INV-20251016-ABC123",
    "order_id": "uuid",
    "seller_id": "uuid",
    "status": "DRAFT",
    "issue_date": "2025-10-16T10:00:00",
    "due_date": "2025-11-15T10:00:00",
    "subtotal": 100.00,
    "tax_amount": 10.00,
    "total_amount": 110.00,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_address": "123 Main St, City, State",
    "seller_name": "Artisan Seller",
    "seller_email": "seller@example.com",
    "seller_address": "456 Business Ave",
    "seller_phone": "+1234567890",
    "notes": "Invoice for order ORD-20251016-ABC123",
    "terms": "Payment due within 30 days of invoice date."
  }
}
```

#### 2. Get Invoices

**Endpoint**: `GET /dashboard/invoices`

**Query Parameters:**
- `seller_id` (optional) - Filter by seller
- `status` (optional) - Filter by status
- `skip` (optional) - Pagination offset
- `limit` (optional) - Number of results (max 100)

**Response:**
```json
{
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-20251016-ABC123",
      "status": "SENT",
      "total_amount": 110.00,
      "customer_name": "John Doe",
      "due_date": "2025-11-15T10:00:00",
      "created_at": "2025-10-16T10:00:00"
    }
  ],
  "metadata": {
    "skip": 0,
    "limit": 100,
    "total": 25
  }
}
```

#### 3. Get Invoice Details

**Endpoint**: `GET /dashboard/invoices/{invoice_id}`

**Response:**
```json
{
  "message": "Invoice retrieved successfully",
  "data": {
    "invoice": {
      "id": "uuid",
      "invoice_number": "INV-20251016-ABC123",
      "status": "SENT",
      "issue_date": "2025-10-16T10:00:00",
      "due_date": "2025-11-15T10:00:00",
      "subtotal": 100.00,
      "tax_amount": 10.00,
      "total_amount": 110.00,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_address": "123 Main St, City, State",
      "seller_name": "Artisan Seller",
      "seller_email": "seller@example.com",
      "seller_address": "456 Business Ave",
      "seller_phone": "+1234567890",
      "notes": "Invoice for order ORD-20251016-ABC123",
      "terms": "Payment due within 30 days of invoice date."
    },
    "items": [
      {
        "id": "uuid",
        "product_name": "Handmade Ceramic Mug",
        "product_description": "Beautiful handcrafted mug",
        "unit_price": 25.00,
        "quantity": 2,
        "total_price": 50.00
      }
    ]
  }
}
```

#### 4. Update Invoice Status

**Endpoint**: `PUT /dashboard/invoices/{invoice_id}/status`

**Request:**
```json
{
  "status": "PAID"
}
```

**Response:**
```json
{
  "message": "Invoice updated successfully",
  "data": {
    "id": "uuid",
    "status": "PAID",
    "paid_date": "2025-10-16T15:30:00",
    "updated_at": "2025-10-16T15:30:00"
  }
}
```

#### 5. Generate PDF Invoice

**Endpoint**: `GET /dashboard/invoices/{invoice_id}/pdf`

**Response:** PDF file download

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=invoice_INV-20251016-ABC123.pdf
```

### PDF Invoice Features

**Professional Layout:**
- Company branding and logo space
- Invoice number and dates
- Seller and customer information
- Itemized product list
- Subtotal, tax, and total calculations
- Payment terms and notes
- Professional formatting with tables and styling

**PDF Content:**
- Invoice header with number and dates
- FROM/TO sections with contact details
- Itemized table with descriptions, quantities, prices
- Totals section with subtotal, tax, and total
- Notes and terms sections
- Footer with generation timestamp

### Authorization Rules

#### Dashboard Access
- **Seller Dashboard**: Sellers and admins can access
- **Admin Dashboard**: Admins only

#### Invoice Access
- **Create Invoice**: Sellers can create invoices for their products, admins for any order
- **View Invoices**: Sellers can view their own invoices, admins can view all
- **Update Status**: Sellers can update their own invoices, admins can update any
- **Generate PDF**: Same access rules as viewing

---

## Technical Implementation

### Database Schema

#### Invoices Table
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    status invoicestatus NOT NULL DEFAULT 'DRAFT',
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    seller_name VARCHAR(100) NOT NULL,
    seller_email VARCHAR(255) NOT NULL,
    seller_address VARCHAR(500),
    seller_phone VARCHAR(20),
    notes VARCHAR(1000),
    terms VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

#### Invoice Items Table
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    product_name VARCHAR(100) NOT NULL,
    product_description VARCHAR(500),
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Service Architecture

#### DashboardService
- `get_seller_dashboard()` - Analytics for individual sellers
- `get_admin_dashboard()` - Platform-wide analytics

#### InvoiceService
- `create_invoice_from_order()` - Generate invoice from order
- `get_invoices()` - List invoices with filtering
- `get_invoice()` - Get invoice with items
- `update_invoice_status()` - Update invoice status

#### PDFGenerator
- `generate_invoice_pdf()` - Create professional PDF
- `generate_simple_invoice_pdf()` - Fallback simple PDF

### Analytics Calculations

#### Revenue Calculation
- Only includes orders with `PAID` payment status
- Sums `total_amount` from orders
- Filters by date range and seller (for seller dashboard)

#### Top Products/Sellers
- Groups by product/seller
- Sums quantities and revenue
- Orders by total sold/revenue
- Limits to top 5 results

#### Daily Trends
- Iterates through date range
- Groups orders by date
- Calculates daily totals
- Returns array of date/revenue pairs

---

## Frontend Integration

### Dashboard Components

#### Seller Dashboard
```jsx
function SellerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [days, setDays] = useState(30);
  
  useEffect(() => {
    fetchDashboardData();
  }, [days]);
  
  const fetchDashboardData = async () => {
    const response = await api.get(`/dashboard/seller?days=${days}`);
    setDashboardData(response.data.data);
  };
  
  return (
    <div className="dashboard">
      <div className="metrics-grid">
        <MetricCard title="Total Products" value={dashboardData?.total_products} />
        <MetricCard title="Total Orders" value={dashboardData?.total_orders} />
        <MetricCard title="Total Revenue" value={`$${dashboardData?.total_revenue}`} />
        <MetricCard title="Pending Orders" value={dashboardData?.pending_orders} />
      </div>
      
      <div className="charts-section">
        <RevenueChart data={dashboardData?.revenue_by_day} />
        <OrderStatusChart data={dashboardData?.order_status_breakdown} />
      </div>
      
      <div className="tables-section">
        <RecentOrdersTable orders={dashboardData?.recent_orders} />
        <TopProductsTable products={dashboardData?.top_products} />
      </div>
    </div>
  );
}
```

#### Admin Dashboard
```jsx
function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    const response = await api.get('/dashboard/admin');
    setDashboardData(response.data.data);
  };
  
  return (
    <div className="dashboard">
      <div className="metrics-grid">
        <MetricCard title="Total Users" value={dashboardData?.total_users} />
        <MetricCard title="Total Sellers" value={dashboardData?.total_sellers} />
        <MetricCard title="Total Products" value={dashboardData?.total_products} />
        <MetricCard title="Total Revenue" value={`$${dashboardData?.total_revenue}`} />
      </div>
      
      <div className="charts-section">
        <RevenueChart data={dashboardData?.revenue_by_day} />
        <UserGrowthChart data={dashboardData?.user_growth_by_day} />
      </div>
      
      <div className="tables-section">
        <RecentOrdersTable orders={dashboardData?.recent_orders} />
        <TopSellersTable sellers={dashboardData?.top_sellers} />
      </div>
    </div>
  );
}
```

### Invoice Management

#### Invoice List
```jsx
function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    fetchInvoices();
  }, [status]);
  
  const fetchInvoices = async () => {
    const params = status ? { status } : {};
    const response = await api.get('/dashboard/invoices', { params });
    setInvoices(response.data.data);
  };
  
  const downloadPDF = async (invoiceId) => {
    const response = await api.get(`/dashboard/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  
  return (
    <div className="invoice-list">
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.customer_name}</td>
              <td>${invoice.total_amount}</td>
              <td>{invoice.status}</td>
              <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => downloadPDF(invoice.id)}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Create Invoice from Order
```jsx
function CreateInvoice({ orderId }) {
  const [dueDays, setDueDays] = useState(30);
  
  const createInvoice = async () => {
    try {
      const response = await api.post('/dashboard/invoices', {
        order_id: orderId,
        due_days: dueDays
      });
      
      alert('Invoice created successfully!');
      // Redirect to invoice list or show success message
    } catch (error) {
      alert('Error creating invoice: ' + error.message);
    }
  };
  
  return (
    <div className="create-invoice">
      <h3>Create Invoice</h3>
      <div>
        <label>Due Days:</label>
        <input
          type="number"
          value={dueDays}
          onChange={(e) => setDueDays(parseInt(e.target.value))}
          min="1"
          max="365"
        />
      </div>
      <button onClick={createInvoice}>Create Invoice</button>
    </div>
  );
}
```

---

## Testing

### Test Dashboard Endpoints

```bash
# Test seller dashboard
curl -X GET "http://localhost:8000/dashboard/seller?days=30" \
  -H "Authorization: Bearer seller_token"

# Test admin dashboard
curl -X GET "http://localhost:8000/dashboard/admin?days=30" \
  -H "Authorization: Bearer admin_token"
```

### Test Invoice Endpoints

```bash
# Create invoice
curl -X POST "http://localhost:8000/dashboard/invoices" \
  -H "Authorization: Bearer seller_token" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_uuid",
    "due_days": 30
  }'

# Get invoices
curl -X GET "http://localhost:8000/dashboard/invoices" \
  -H "Authorization: Bearer seller_token"

# Get invoice PDF
curl -X GET "http://localhost:8000/dashboard/invoices/invoice_uuid/pdf" \
  -H "Authorization: Bearer seller_token" \
  --output invoice.pdf

# Update invoice status
curl -X PUT "http://localhost:8000/dashboard/invoices/invoice_uuid/status" \
  -H "Authorization: Bearer seller_token" \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}'
```

---

## Security Considerations

1. **Role-Based Access**: Strict authorization for dashboard and invoice access
2. **Data Isolation**: Sellers can only access their own data
3. **PDF Security**: PDFs contain sensitive financial information
4. **Invoice Numbers**: Unique, non-guessable invoice numbers
5. **Status Validation**: Proper status transitions (DRAFT → SENT → PAID)

---

## Performance Notes

1. **Analytics Queries**: Optimized with proper indexes and joins
2. **PDF Generation**: In-memory PDF creation for fast response
3. **Caching**: Consider caching dashboard data for better performance
4. **Pagination**: Invoice lists support pagination for large datasets

---

## Files Created/Modified

### New Files:
- `src/dashboard/models.py` - Invoice and invoice item models
- `src/dashboard/service.py` - Dashboard and invoice services
- `src/dashboard/schema.py` - Pydantic schemas
- `src/dashboard/routes.py` - API endpoints
- `src/dashboard/pdf_generator.py` - PDF generation service
- `alembic/versions/f6a14e821ec7_*.py` - Database migration

### Modified Files:
- `main.py` - Added dashboard router
- `src/db/__init__.py` - Added model imports
- `requirements.txt` - Added reportlab dependency

---

## Future Enhancements

1. **Email Integration**: Send invoices via email
2. **Payment Integration**: Link invoices to payment processing
3. **Invoice Templates**: Customizable invoice templates
4. **Bulk Operations**: Bulk invoice creation and status updates
5. **Advanced Analytics**: More detailed charts and metrics
6. **Export Features**: Export dashboard data to CSV/Excel
7. **Real-time Updates**: WebSocket updates for dashboard data
8. **Invoice Reminders**: Automated overdue invoice reminders

---

## Summary

✅ **Dashboard Analytics**: Real-time business insights for sellers and admins  
✅ **Invoice Generator**: Automated invoice creation from orders  
✅ **PDF Generation**: Professional PDF invoices with ReportLab  
✅ **Role-Based Access**: Proper authorization for all features  
✅ **Database Migration**: Successfully applied  
✅ **API Documentation**: Complete endpoint documentation  
✅ **Frontend Examples**: React integration examples  

**Status**: ✅ Ready for Production

**Version**: 3.0  
**Implementation Date**: October 16, 2025
