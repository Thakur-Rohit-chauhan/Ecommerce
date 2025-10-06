import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Orders() {
  // Dummy orders
  const orders = [
    {
      id: 101,
      date: '2025-09-20',
      status: 'Delivered',
      items: [
        { name: 'Product 1', price: 499 },
        { name: 'Product 2', price: 999 },
      ],
      total: 1498,
    },
    {
      id: 102,
      date: '2025-09-18',
      status: 'Shipped',
      items: [
        { name: 'Product 3', price: 799 },
      ],
      total: 799,
    },
  ];

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>My Orders</h1>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <h3>Order #{order.id} - {order.status}</h3>
            <p>Date: {order.date}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>{item.name} - ₹{item.price}</li>
              ))}
            </ul>
            <strong>Total: ₹{order.total}</strong>
          </div>
        ))}
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
