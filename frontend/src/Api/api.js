// src/Api/api.js
import axios from 'axios';

// Replace with your backend URL
const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add request interceptor to include auth token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Vendor/Seller API functions
export const vendorAPI = {
  // Get seller dashboard data
  getDashboard: async (days = 30) => {
    const response = await api.get(`/dashboard/seller`);
    return response.data;
  },

  // Get seller's products
  getMyProducts: async (page = 1, limit = 100, search = "") => {
    const response = await api.get(`/products/my-products?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  // Get all products
  getAllProducts: async (page = 1, limit = 100, search = "") => {
    const response = await api.get(`/products?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // Get product by ID
  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Get seller's invoices
  getInvoices: async (status = null, skip = 0, limit = 100) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('skip', skip);
    params.append('limit', limit);
    
    const response = await api.get(`/dashboard/invoices?${params.toString()}`);
    return response.data;
  },

  // Create invoice from order
  createInvoice: async (orderId, dueDays = 30) => {
    const response = await api.post('/dashboard/invoices', {
      order_id: orderId,
      due_days: dueDays
    });
    return response.data;
  },

  // Update invoice status
  updateInvoiceStatus: async (invoiceId, status) => {
    const response = await api.put(`/dashboard/invoices/${invoiceId}/status?status=${status}`);
    return response.data;
  },

  // Get invoice PDF
  getInvoicePDF: async (invoiceId) => {
    const response = await api.get(`/dashboard/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get seller's orders
  getMyOrders: async (skip = 0, limit = 100, status = null, payment_status = null) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (payment_status) params.append('payment_status', payment_status);
    
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default api;
