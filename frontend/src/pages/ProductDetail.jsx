import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProductDetail() {
  const navigate = useNavigate();

  // Dummy product
  const [product] = useState({
    id: 1,
    name: 'Smartphone XYZ',
    price: 14999,
    discount: 10,
    images: ['/images/phone1.jpg', '/images/phone2.jpg', '/images/phone3.jpg'],
    description: 'This is a high-quality smartphone with excellent features.',
    rating: 4.5,
    reviews: [
      { id: 1, user: 'Alice', comment: 'Great phone!', rating: 5 },
      { id: 2, user: 'Bob', comment: 'Good value for money.', rating: 4 },
    ],
  });

  const [currentImage, setCurrentImage] = useState(0);

  // Dummy Add to Cart handler
  const handleAddToCart = () => {
    const token = localStorage.getItem('authToken'); // check if user is logged in

    if (!token) {
      // Not logged in → redirect to login
      navigate('/login');
      return;
    }

    // Logged in → add product to dummy cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((p) => p.id === product.id);

    if (existingProduct) {
      alert('Product already in cart!');
    } else {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Product added to cart!');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.left}>
          <img src={product.images[currentImage]} alt={product.name} style={styles.mainImage} />
          <div style={styles.thumbnailContainer}>
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="thumbnail"
                style={{
                  ...styles.thumbnail,
                  border: idx === currentImage ? '2px solid #ffcc00' : '1px solid #ccc',
                }}
                onClick={() => setCurrentImage(idx)}
              />
            ))}
          </div>
        </div>

        <div style={styles.right}>
          <h1>{product.name}</h1>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ₹{product.price}{' '}
            {product.discount > 0 && <span style={{ color: 'green' }}>({product.discount}% OFF)</span>}
          </p>
          <p>{product.description}</p>

          <div style={{ margin: '1rem 0' }}>
            <button style={styles.button} onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Reviews</h3>
            {product.reviews.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>
                <p>
                  <strong>{r.user}</strong> ({r.rating}⭐)
                </p>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { display: 'flex', flexWrap: 'wrap', maxWidth: '1200px', margin: '2rem auto', gap: '2rem', padding: '0 1rem' },
  left: { flex: '1 1 300px' },
  mainImage: { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' },
  thumbnailContainer: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' },
  right: { flex: '1 1 400px' },
  button: { padding: '0.8rem 1.5rem', fontSize: '1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#ffcc00', fontWeight: 'bold' },
};

export default ProductDetail;
