import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
function Cart() {
   const navigate = useNavigate();
  // Dummy cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Smartphone XYZ',
      price: 14999,
      quantity: 1,
      image: '/images/phone1.jpg',
    },
    {
      id: 2,
      name: 'Headphones ABC',
      price: 1999,
      quantity: 2,
      image: '/images/headphones.jpg',
    },
  ]);
  const handleCheckout = () => {
    navigate('/checkout'); // navigate to Checkout page
  };
  const handleQuantityChange = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>My Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div style={styles.cartWrapper}>
            <div style={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.item}>
                  <img src={item.image} alt={item.name} style={styles.image} />
                  <div style={styles.details}>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <div style={styles.quantity}>
                      <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                      <span style={{ margin: '0 1rem' }}>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} style={styles.remove}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h2>Price Summary</h2>
              <p>Subtotal: ₹{subtotal}</p>
              <p>Discount: ₹0</p>
              <p><strong>Total: ₹{subtotal}</strong></p>
              <button onClick={handleCheckout} style={styles.checkout}>Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  cartWrapper: { display: 'flex', flexWrap: 'wrap', gap: '2rem' },
  items: { flex: '2 1 600px' },
  item: { display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', padding: '1rem 0' },
  image: { width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' },
  details: { flex: 1 },
  quantity: { display: 'flex', alignItems: 'center', marginTop: '0.5rem' },
  remove: { marginTop: '0.5rem', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' },
  summary: { flex: '1 1 250px', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', height: 'fit-content' },
  checkout: { width: '100%', padding: '0.8rem', marginTop: '1rem', backgroundColor: '#ffcc00', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
};

export default Cart;
