import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Checkout() {
  // Dummy saved addresses
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      name: 'John Doe',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001',
      phone: '9876543210',
    },
    {
      id: 2,
      name: 'Jane Smith',
      street: '456 Park Lane',
      city: 'Delhi',
      state: 'Delhi',
      zip: '110001',
      phone: '9123456780',
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0].id);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    let addressToUse;

    // Address validation
    if (useNewAddress) {
      const { name, street, city, state, zip, phone } = newAddress;
      if (!name || !street || !city || !state || !zip || !phone) {
        alert('Please fill all fields for the new address.');
        return;
      }
      addressToUse = newAddress;
    } else {
      addressToUse = savedAddresses.find((addr) => addr.id === selectedAddressId);
    }

    // Payment validation
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    if (paymentMethod === 'card') {
      const { number, expiry, cvv } = cardDetails;
      if (!number || !expiry || !cvv) {
        alert('Please fill all card details.');
        return;
      }
    }
    if (paymentMethod === 'UPI' && !upiId) {
      alert('Please enter your UPI ID.');
      return;
    }

    // Dummy success
    console.log('Order Placed with Address:', addressToUse);
    console.log('Payment Method:', paymentMethod, paymentMethod === 'card' ? cardDetails : upiId);
    alert('Order placed successfully! (Dummy, backend not connected yet)');
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Checkout</h1>
        <div style={styles.wrapper}>
          {/* Address Selection */}
          <div style={styles.form}>
            <h2>Delivery Address</h2>
            {savedAddresses.map((addr) => (
              <label key={addr.id} style={styles.addressLabel}>
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id && !useNewAddress}
                  onChange={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                />
                {`${addr.name}, ${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.phone}`}
              </label>
            ))}

            <label style={{ marginTop: '1rem' }}>
              <input
                type="checkbox"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(!useNewAddress)}
              />
              Add New Address
            </label>

            {useNewAddress && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input name="name" placeholder="Full Name" value={newAddress.name} onChange={handleNewAddressChange} />
                <input name="street" placeholder="Street Address" value={newAddress.street} onChange={handleNewAddressChange} />
                <input name="city" placeholder="City" value={newAddress.city} onChange={handleNewAddressChange} />
                <input name="state" placeholder="State" value={newAddress.state} onChange={handleNewAddressChange} />
                <input name="zip" placeholder="ZIP Code" value={newAddress.zip} onChange={handleNewAddressChange} />
                <input name="phone" placeholder="Phone Number" value={newAddress.phone} onChange={handleNewAddressChange} />
              </div>
            )}
          </div>

          {/* Payment & Summary */}
          <div style={styles.summary}>
            <h2>Payment Method</h2>
            <label>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              Cash on Delivery
            </label>
            <label>
              <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
              UPI
            </label>
            <label>
              <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              Credit/Debit Card
            </label>

            {/* Conditional Payment Fields */}
            {paymentMethod === 'UPI' && (
              <input
                type="text"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={{ marginTop: '0.5rem', padding: '0.5rem' }}
              />
            )}

            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Expiry Date (MM/YY)"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                />
              </div>
            )}

            <h2>Order Summary</h2>
            <p>Subtotal: ₹16997</p>
            <p>Discount: ₹0</p>
            <p><strong>Total: ₹16997</strong></p>

            <button style={styles.button} onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  wrapper: { display: 'flex', flexWrap: 'wrap', gap: '2rem' },
  form: { flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  addressLabel: { display: 'block', marginBottom: '0.5rem' },
  summary: { flex: '1 1 300px', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' },
  button: { marginTop: '1rem', width: '100%', padding: '0.8rem', backgroundColor: '#ffcc00', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
};

export default Checkout;
