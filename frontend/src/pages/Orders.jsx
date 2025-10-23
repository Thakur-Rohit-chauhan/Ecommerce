import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../Api/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <h1>My Orders</h1>
          <p>Loading orders...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <h1>My Orders</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <h3>Order #{order.id} - {order.status}</h3>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Payment Status: {order.payment_status}</p>
              <p>Shipping Address: {order.shipping_address}</p>
              <ul>
                {order.order_items.map((item, idx) => (
                  <li key={idx}>
                    {item.product.title} x {item.quantity} - ₹{item.product.price * item.quantity}
                  </li>
                ))}
              </ul>
              <strong>Total: ₹{order.total_amount}</strong>
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  orderCard: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9',
  },
};

export default Orders;