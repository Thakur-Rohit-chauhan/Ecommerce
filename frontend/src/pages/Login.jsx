import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-login if token/user exists
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'vendor') navigate('/vendor');
      else navigate('/profile');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Login failed.');

      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'vendor') navigate('/vendor');
      else navigate('/profile');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Login</h1>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Don’t have an account? <a href="/register">Signup here</a>
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
  input: {
    padding: '0.6rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.6rem',
    fontSize: '1rem',
    backgroundColor: '#ffcc00',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default Login;
