# Dashboard & Invoice Features - Quick Start

## ✅ What's New

Two powerful features have been added to Artisans Alley:

### 1. 📊 Dashboard Analytics
Real-time business insights for sellers and admins with comprehensive metrics and charts.

### 2. 🧾 Invoice Generator
Automated invoice creation and professional PDF generation from orders.

---

## 🚀 Quick Test

### Test Dashboard

```bash
# Seller Dashboard
curl -X GET "http://localhost:8000/dashboard/seller?days=30" \
  -H "Authorization: Bearer seller_token"

# Admin Dashboard  
curl -X GET "http://localhost:8000/dashboard/admin?days=30" \
  -H "Authorization: Bearer admin_token"
```

### Test Invoice Creation

```bash
# Create invoice from order
curl -X POST "http://localhost:8000/dashboard/invoices" \
  -H "Authorization: Bearer seller_token" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "your_order_uuid",
    "due_days": 30
  }'

# Download PDF invoice
curl -X GET "http://localhost:8000/dashboard/invoices/invoice_uuid/pdf" \
  -H "Authorization: Bearer seller_token" \
  --output invoice.pdf
```

---

## 📋 New API Endpoints

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/seller` | Seller analytics dashboard | Seller/Admin |
| GET | `/dashboard/admin` | Admin platform dashboard | Admin |

### Invoice Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/dashboard/invoices` | Create invoice from order | Seller/Admin |
| GET | `/dashboard/invoices` | List invoices with filtering | Seller/Admin |
| GET | `/dashboard/invoices/{id}` | Get invoice details | Seller/Admin |
| PUT | `/dashboard/invoices/{id}/status` | Update invoice status | Seller/Admin |
| GET | `/dashboard/invoices/{id}/pdf` | Download PDF invoice | Seller/Admin |

---

## 📊 Dashboard Features

### Seller Dashboard Data
- **Total Products**: Number of products listed
- **Total Orders**: Orders for seller's products
- **Total Revenue**: Revenue from paid orders
- **Pending Orders**: Orders awaiting processing
- **Recent Orders**: Last 10 orders with customer details
- **Top Products**: Best-selling products by quantity/revenue
- **Revenue Trends**: Daily revenue for last 30 days
- **Status Breakdowns**: Order and payment status distributions

### Admin Dashboard Data
- **Platform Metrics**: Total users, sellers, products, orders, revenue
- **Recent Orders**: Last 10 orders across all sellers
- **Top Sellers**: Best-performing sellers by revenue
- **Revenue Trends**: Daily platform revenue
- **User Growth**: Daily user registration trends
- **Status Breakdowns**: Platform-wide order and payment statistics

---

## 🧾 Invoice Features

### Invoice Creation
- **Automatic Generation**: Create invoices from existing orders
- **Seller-Specific**: Only includes products from the seller
- **Customer Snapshot**: Captures customer info at time of invoice
- **Flexible Due Dates**: Configurable payment terms (1-365 days)

### Invoice Status Flow
```
DRAFT → SENT → PAID
  ↓       ↓
CANCELLED OVERDUE
```

### PDF Invoice Features
- **Professional Layout**: Clean, branded invoice design
- **Complete Information**: Seller and customer details
- **Itemized List**: Product details with quantities and prices
- **Financial Summary**: Subtotal, tax, and total calculations
- **Payment Terms**: Customizable terms and notes
- **Download Ready**: Direct PDF download via API

---

## 💻 Frontend Integration

### Dashboard Component
```jsx
function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchDashboard();
  }, []);
  
  const fetchDashboard = async () => {
    const response = await api.get('/dashboard/seller');
    setData(response.data.data);
  };
  
  return (
    <div className="dashboard">
      <div className="metrics">
        <div className="metric">
          <h3>Total Revenue</h3>
          <p>${data?.total_revenue}</p>
        </div>
        <div className="metric">
          <h3>Total Orders</h3>
          <p>{data?.total_orders}</p>
        </div>
        <div className="metric">
          <h3>Pending Orders</h3>
          <p>{data?.pending_orders}</p>
        </div>
      </div>
      
      <div className="charts">
        <RevenueChart data={data?.revenue_by_day} />
        <OrderStatusChart data={data?.order_status_breakdown} />
      </div>
      
      <div className="tables">
        <RecentOrdersTable orders={data?.recent_orders} />
        <TopProductsTable products={data?.top_products} />
      </div>
    </div>
  );
}
```

### Invoice Management
```jsx
function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  
  const createInvoice = async (orderId) => {
    await api.post('/dashboard/invoices', {
      order_id: orderId,
      due_days: 30
    });
    fetchInvoices();
  };
  
  const downloadPDF = async (invoiceId) => {
    const response = await api.get(`/dashboard/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${invoiceId}.pdf`;
    link.click();
  };
  
  return (
    <div className="invoice-manager">
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
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

---

## 🔐 Authorization Rules

### Dashboard Access
- **Seller Dashboard**: Sellers and admins
- **Admin Dashboard**: Admins only

### Invoice Access
- **Create**: Sellers (their products only), Admins (any order)
- **View**: Sellers (their invoices only), Admins (all invoices)
- **Update**: Sellers (their invoices only), Admins (any invoice)
- **PDF**: Same rules as viewing

---

## 📈 Sample Dashboard Response

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
        "customer_name": "John Doe"
      }
    ],
    "top_products": [
      {
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
    ]
  }
}
```

---

## 🧾 Sample Invoice Response

```json
{
  "message": "Invoice created successfully",
  "data": {
    "id": "uuid",
    "invoice_number": "INV-20251016-ABC123",
    "status": "DRAFT",
    "total_amount": 110.00,
    "customer_name": "John Doe",
    "due_date": "2025-11-15T10:00:00",
    "seller_name": "Artisan Seller"
  }
}
```

---

## 🎯 Next Steps

1. **Frontend Dashboard**:
   - Create dashboard pages for sellers and admins
   - Add charts and graphs for visual analytics
   - Implement real-time updates

2. **Invoice Management**:
   - Add invoice list page
   - Create invoice detail view
   - Implement PDF download functionality

3. **Enhanced Features**:
   - Email invoice delivery
   - Payment integration
   - Invoice reminders
   - Custom invoice templates

---

## 📚 Full Documentation

See **DASHBOARD_AND_INVOICE_FEATURES.md** for complete documentation including:
- Detailed API documentation
- Database schema
- Technical implementation
- Security considerations
- Performance notes
- Frontend integration examples

---

## ✨ Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Seller Dashboard | ✅ Complete | Analytics for individual sellers |
| Admin Dashboard | ✅ Complete | Platform-wide analytics |
| Invoice Creation | ✅ Complete | Generate invoices from orders |
| Invoice Management | ✅ Complete | List, view, update invoices |
| PDF Generation | ✅ Complete | Professional PDF invoices |
| Role-Based Access | ✅ Complete | Proper authorization |
| Database Migration | ✅ Applied | Migration f6a14e821ec7 |
| API Documentation | ✅ Complete | Full endpoint docs |

---

**Ready to Use!** 🚀

All features are implemented, tested, and ready for production.

**Need Help?** Check the full documentation in `DASHBOARD_AND_INVOICE_FEATURES.md`
