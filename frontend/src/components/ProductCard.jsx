import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <img src={product.image} alt={product.name} style={styles.image} />
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.price}>₹{product.price}</p>
      
      
      <button style={styles.button}>Add to Cart</button>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    marginBottom: '0.5rem',
  },
  name: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  price: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  button: {
    padding: '0.5rem',
    width: '100%',
    backgroundColor: '#0077ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ProductCard;
