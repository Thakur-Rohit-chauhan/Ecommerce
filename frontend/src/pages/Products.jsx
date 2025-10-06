import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

function Products() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  // Dummy categories
  const categories = ["All", "Fruits", "Vegetables", "Groceries", "Handicrafts", "Spices", "Clothes"];

  // Dummy products
  const allProducts = [
    { id: 1, name: "Fresh Mangoes", price: 120, category: "Fruits", image: "https://tse4.mm.bing.net/th/id/OIP.zbPKD1tYn395bESRngvNvwHaEK?pid=Api&P=0&h=180" },
    { id: 2, name: "Organic Rice (5kg)", price: 899, category: "Groceries", image: "https://tse2.mm.bing.net/th/id/OIP.0xhpvvifqNNR8Y_FhfhkzwHaEK?pid=Api&P=0&h=180" },
    { id: 3, name: "Handmade Jute Bag", price: 499, category: "Handicrafts", image: "https://shop.gaatha.com/image/cache/catalog/Gaatha/10_12_2020/Getting-carried-away-Handmade-Jute-bag-Jute-File-Folder-7-845x435.jpg" },
    { id: 4, name: "Clay Pot", price: 299, category: "Handicrafts", image: "https://tse3.mm.bing.net/th/id/OIP.kTIyl5itptrgrWvI3BeJegHaE8?pid=Api&P=0&h=180" },
    { id: 5, name: "Fresh Tomatoes", price: 60, category: "Vegetables", image: "https://tse1.mm.bing.net/th/id/OIP.MnO7emBcmN0p-miR6swgswHaEu?pid=Api&P=0&h=180" },
    { id: 6, name: "Traditional Kurta", price: 999, category: "Clothes", image: "https://tse1.mm.bing.net/th/id/OIP.ytMn-SRy12TBvVTfNs8irwHaLH?pid=Api&P=0&h=180" },
    { id: 7, name: "Spice Mix Pack", price: 349, category: "Spices", image: "https://tse3.mm.bing.net/th/id/OIP.JXMlDTr5D_4od7zwi1zaqAHaFj?pid=Api&P=0&h=180" },
    { id: 8, name: "Banana Leaf Basket", price: 150, category: "Handicrafts", image: "https://tse2.mm.bing.net/th/id/OIP.Xf494iEH55WzTh9-5Za-EAHaFW?pid=Api&P=0&h=180" },
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [products, setProducts] = useState(allProducts);

  useEffect(() => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery));
    }

    // Sort
    if (sortOption === 'priceLow') filtered.sort((a, b) => a.price - b.price);
    if (sortOption === 'priceHigh') filtered.sort((a, b) => b.price - a.price);

    setProducts(filtered);
  }, [selectedCategory, sortOption, searchQuery]);

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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={styles.select}
            >
              <option value="">Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div style={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && <p>No products found for "{searchQuery}"</p>}
        </div>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  title: { fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    marginLeft: '0.5rem',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
};

export default Products;
