import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy authentication
    // Only accept these credentials for testing
    const dummyEmail = 'user@example.com';
    const dummyPassword = '123456';

    if (email === dummyEmail && password === dummyPassword) {
      // Save token to localStorage
      localStorage.setItem('authToken', 'dummy-token');
      alert('Login successful!');
      navigate('/profile'); // redirect to profile after login
    } else {
      alert('Invalid email or password.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Login</h1>
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
          Don’t have an account? <a href="/signup">Signup here</a>
        </p>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.6rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  button: { padding: '0.6rem', fontSize: '1rem', backgroundColor: '#ffcc00', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default Login;
