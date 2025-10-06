import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy authentication
    const vendorInfo = {
  name: 'Vendor ABC',
  shopName: 'ABC Store',
  email: email,
  address: '123 Street, City',
  phone: '+91 9876543210',
};
    if (email === 'vendor@example.com' && password === '123456') {
      localStorage.setItem('vendorToken', 'dummyVendorToken'); // store vendor token
      localStorage.setItem('vendorData', JSON.stringify(vendorInfo));
      navigate('/Vendorprofile'); // redirect to vendor profile
    } else {
      alert('Invalid vendor credentials!');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Vendor Login</h1>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Don’t have an account? <Link to="/vendorsignup">Sign up here</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

// Optional: styles remain same
const styles = {
  container: { maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.6rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  button: { padding: '0.6rem', fontSize: '1rem', backgroundColor: '#ffcc00', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default VendorLogin;
