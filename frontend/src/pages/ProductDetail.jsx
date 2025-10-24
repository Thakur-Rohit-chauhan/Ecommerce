import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/products/${id}`);
        if (!response.ok) throw new Error('Failed to load product');
        const result = await response.json();
        setProduct(result.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // No longer needed - user cart is auto-created on signup and accessed via /carts/me

  const handleAddToCart = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      console.log('Adding product to cart:', product.id);

      // Use the simplified endpoint - no cart ID needed!
      const response = await fetch('http://localhost:8000/carts/me/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      const result = await response.json();
      console.log('Response:', result);

      if (!response.ok) {
        // Check if it's an authentication error
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(result.detail || result.message || 'Failed to add item to cart');
      }
      
      alert('✅ Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Failed to add to cart. Please try again.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading product...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  if (!product) return <p style={{ textAlign: 'center' }}>No product found.</p>;

  const isAvailable = product.stock > 0;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.left}>
          <img
            src={product.images?.[currentImage] || product.thumbnail || 'https://via.placeholder.com/400'}
            alt={product.title}
            style={styles.mainImage}
          />
          {product.images && product.images.length > 1 && (
            <div style={styles.thumbnailContainer}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: idx === currentImage ? '2px solid #ffcc00' : '1px solid #ccc',
                  }}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.right}>
          <h1>{product.title}</h1>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ₹{Number(product.price).toLocaleString()}{' '}
            {product.discount_percentage > 0 && (
              <span style={{ color: 'green' }}>({product.discount_percentage}% OFF)</span>
            )}
          </p>
          <p>{product.description}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Rating:</strong> {product.rating}⭐</p>
          {!isAvailable && <p style={{ color: 'red', fontWeight: 'bold' }}>Product Not Available</p>}

          <div style={{ margin: '1rem 0' }}>
            <button
              style={{
                ...styles.button,
                backgroundColor: isAvailable ? '#ffcc00' : '#ccc',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
              }}
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '2rem auto',
    gap: '2rem',
    padding: '0 1rem',
  },
  left: { flex: '1 1 300px' },
  mainImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  thumbnailContainer: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  thumbnail: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  right: { flex: '1 1 400px' },
  button: {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
  },
};

export default ProductDetail;
