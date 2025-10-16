import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const role = 'normal_user'; // default role

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    const requestBody = {
      email,
      username,
      full_name: fullName,
      phone_number: phoneNumber,
      address,
      password,
      role,
    };

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Signup successful! You can now login.');
        // Clear form
        setEmail('');
        setUsername('');
        setFullName('');
        setPhoneNumber('');
        setAddress('');
        setPassword('');
      } else {
        setMessage(data.error || 'Signup failed. Try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Signup</h1>
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.6rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  button: { padding: '0.6rem', fontSize: '1rem', backgroundColor: '#ffcc00', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default Signup;
