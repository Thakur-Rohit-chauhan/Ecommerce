import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories & products
  const fetchData = async () => {
    try {
      // Fetch categories
      const catRes = await fetch('http://localhost:8000/categories');
      if (!catRes.ok) throw new Error('Failed to fetch categories');
      const catResult = await catRes.json();
      const catList = catResult.data || [];
      const map = {};
      catList.forEach(c => (map[c.id] = c.name));
      setCategoryMap(map);
      setCategories(['All', ...catList.map(c => c.name)]);

      // Fetch products
      const prodRes = await fetch('http://localhost:8000/products/');
      if (!prodRes.ok) throw new Error('Invalid response from server');
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData.data) ? prodData.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & sort
  const filteredProducts = products
    .filter(p => {
      const categoryName = categoryMap[p.category_id] || 'Unknown';
      return selectedCategory === 'All' || categoryName === selectedCategory;
    })
    .filter(p => p.title.toLowerCase().includes(searchQuery))
    .sort((a, b) => {
      if (sortOption === 'priceLow') return Number(a.price) - Number(b.price);
      if (sortOption === 'priceHigh') return Number(b.price) - Number(a.price);
      return 0;
    });

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Products</h1>

        {/* Filters */}
        <div style={styles.filters}>
          <div>
            <strong>Category:</strong>
            <select
              id="category-select"
              name="category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={styles.select}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <strong>Sort By:</strong>
            <select
              id="sort-select"
              name="sort"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              style={styles.select}
            >
              <option value="">Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Product Grid */}
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={styles.productGrid}>
          {!loading && !error && filteredProducts.length > 0 && filteredProducts.map(product => (
            <div
              key={product.id}
              style={styles.card}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img
                src={product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/200'}
                alt={product.title || 'Product'}
                style={styles.image}
              />
              <h3 style={styles.productTitle}>{product.title}</h3>
              <p style={styles.price}>₹{product.price}</p>
              <p style={styles.brand}>{product.brand}</p>
              <p style={styles.category}>{categoryMap[product.category_id]}</p>
            </div>
          ))}

          {!loading && filteredProducts.length === 0 && (
            <p>No products found for "{searchQuery}"</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  title: { fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  select: { padding: '0.5rem', fontSize: '1rem', marginLeft: '0.5rem' },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '0.5rem',
  },
  productTitle: { fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0' },
  price: { color: '#28a745', fontWeight: 'bold' },
  brand: { color: '#555', fontSize: '0.9rem' },
  category: { color: '#888', fontSize: '0.85rem', marginTop: '0.3rem' },
};

export default Products;
