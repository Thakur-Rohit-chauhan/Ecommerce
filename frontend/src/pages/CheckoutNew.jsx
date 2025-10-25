import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartService, orderService, paymentService, authService } from '../services';

function CheckoutNew() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Shipping info
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentDetails, setPaymentDetails] = useState({
    // Stripe
    card_number: '',
    card_expiry: '',
    card_cvc: '',
    card_holder: '',
    // PayPal
    paypal_email: '',
    // Manual
    payment_type: 'cash_on_delivery',
    payment_notes: '',
  });

  useEffect(() => {
    fetchCart();
    loadUserInfo();
  }, []);

  const fetchCart = async () => {
    try {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const response = await cartService.getMyCart();
      const cartData = response.data;

      if (!cartData || !cartData.cart_items || cartData.cart_items.length === 0) {
        alert('Your cart is empty!');
        navigate('/cart');
        return;
      }

      setCart(cartData);
      setCartItems(cartData.cart_items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
      setLoading(false);
    }
  };

  const loadUserInfo = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setShippingInfo({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        address: user.address || '',
        city: '',
        state: '',
        zipCode: '',
      });
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      alert('Please fill in all shipping information');
      return false;
    }

    // Validate payment details
    const validation = paymentService.validatePaymentDetails(paymentMethod, paymentDetails);
    if (!validation.valid) {
      alert('Payment details invalid:\n' + validation.errors.join('\n'));
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    setError('');

    try {
      // Create order
      const orderData = {
        cart_id: cart.id,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
        billing_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
        payment_method: paymentMethod,
        contact_phone: shippingInfo.phone,
        contact_email: shippingInfo.email,
      };

      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data;

      // Create payment
      const paymentData = {
        order_id: order.id,
        amount: calculateTotal(),
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      };

      const paymentResponse = await paymentService.createPayment(paymentData);
      const payment = paymentResponse.data;

      // Process payment if not manual
      if (paymentMethod !== 'manual') {
        await paymentService.processPayment(payment.id, paymentMethod, paymentDetails);
      }

      // Success!
      alert('✅ Order placed successfully!');
      navigate(`/orders`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.subtotal_price) || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateShipping = () => {
    return 50; // Fixed shipping cost
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>Checkout</h1>
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !cart) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>Checkout</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  const paymentMethods = paymentService.getPaymentMethods();

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Checkout</h1>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.checkoutGrid}>
          {/* Left side - Forms */}
          <div style={styles.leftPanel}>
            {/* Shipping Information */}
            <div style={styles.section}>
              <h2>Shipping Information</h2>
              <div style={styles.formGrid}>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  style={styles.input}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  style={styles.input}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  style={styles.input}
                  required
                />
                <textarea
                  name="address"
                  placeholder="Street Address *"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  style={{ ...styles.input, gridColumn: '1 / -1', minHeight: '60px' }}
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  style={styles.input}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  style={styles.input}
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div style={styles.section}>
              <h2>Payment Method</h2>
              <div style={styles.paymentMethods}>
                {paymentMethods.filter(m => m.enabled).map(method => (
                  <div
                    key={method.id}
                    style={{
                      ...styles.paymentMethod,
                      ...(paymentMethod === method.id ? styles.paymentMethodSelected : {})
                    }}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span style={styles.paymentIcon}>{method.icon}</span>
                    <div>
                      <strong>{method.name}</strong>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Details Form */}
              {paymentMethod === 'stripe' && (
                <div style={styles.paymentForm}>
                  <h3>Card Details</h3>
                  <input
                    type="text"
                    name="card_holder"
                    placeholder="Cardholder Name"
                    value={paymentDetails.card_holder}
                    onChange={handlePaymentDetailsChange}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    name="card_number"
                    placeholder="Card Number"
                    value={paymentDetails.card_number}
                    onChange={handlePaymentDetailsChange}
                    style={styles.input}
                    maxLength="16"
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                      type="text"
                      name="card_expiry"
                      placeholder="MM/YY"
                      value={paymentDetails.card_expiry}
                      onChange={handlePaymentDetailsChange}
                      style={styles.input}
                      maxLength="5"
                    />
                    <input
                      type="text"
                      name="card_cvc"
                      placeholder="CVC"
                      value={paymentDetails.card_cvc}
                      onChange={handlePaymentDetailsChange}
                      style={styles.input}
                      maxLength="3"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div style={styles.paymentForm}>
                  <h3>PayPal Details</h3>
                  <input
                    type="email"
                    name="paypal_email"
                    placeholder="PayPal Email"
                    value={paymentDetails.paypal_email}
                    onChange={handlePaymentDetailsChange}
                    style={styles.input}
                  />
                </div>
              )}

              {paymentMethod === 'manual' && (
                <div style={styles.paymentForm}>
                  <h3>Manual Payment</h3>
                  <select
                    name="payment_type"
                    value={paymentDetails.payment_type}
                    onChange={handlePaymentDetailsChange}
                    style={styles.input}
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI Payment</option>
                  </select>
                  <textarea
                    name="payment_notes"
                    placeholder="Additional Notes (Optional)"
                    value={paymentDetails.payment_notes}
                    onChange={handlePaymentDetailsChange}
                    style={{ ...styles.input, minHeight: '60px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right side - Order Summary */}
          <div style={styles.rightPanel}>
            <div style={styles.summary}>
              <h2>Order Summary</h2>
              
              {/* Cart Items */}
              <div style={styles.summaryItems}>
                {cartItems.map(item => (
                  <div key={item.id} style={styles.summaryItem}>
                    <img
                      src={item.product?.thumbnail || 'https://via.placeholder.com/60'}
                      alt={item.product?.title}
                      style={styles.summaryImage}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={styles.summaryItemTitle}>{item.product?.title}</p>
                      <p style={styles.summaryItemQty}>Qty: {item.quantity}</p>
                    </div>
                    <p style={styles.summaryItemPrice}>
                      {cartService.formatPrice(item.subtotal_price)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div style={styles.summaryPricing}>
                <div style={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Tax (GST 18%):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>₹{calculateShipping().toFixed(2)}</span>
                </div>
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <div style={{ ...styles.summaryRow, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#28a745' }}>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                style={{
                  ...styles.placeOrderButton,
                  ...(processing ? styles.buttonDisabled : {})
                }}
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>

              <p style={styles.secureText}>🔒 Secure Checkout</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightPanel: {
    position: 'sticky',
    top: '2rem',
    height: 'fit-content',
  },
  section: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    width: '100%',
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  paymentMethodSelected: {
    borderColor: '#ffcc00',
    backgroundColor: '#fffef5',
  },
  paymentIcon: {
    fontSize: '2rem',
  },
  paymentForm: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  summary: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  summaryItems: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  summaryItem: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  summaryImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  summaryItemTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    margin: 0,
  },
  summaryItemQty: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0.25rem 0 0 0',
  },
  summaryItemPrice: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  summaryPricing: {
    marginTop: '1rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0.5rem 0',
  },
  placeOrderButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    backgroundColor: '#ffcc00',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  secureText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.5rem',
  },
};

export default CheckoutNew;

