import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
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

  const categories = ["All", "Fruits", "Vegetables", "Groceries", "Handicrafts", "Spices", "Clothes"];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shuffledProducts, setShuffledProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    setShuffledProducts(shuffled);
  }, []);

  const filteredProducts = (search ? allProducts : shuffledProducts).filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = search ? filteredProducts : filteredProducts.slice(0, visibleCount);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>🛍️ Support Local, Shop Local</h1>
          <p>Discover fresh produce, handmade crafts, and traditional goods from your community.</p>
          <button className="hero-btn">Explore Now</button>
        </div>
        <div className="hero-img">
          <img src="https://tse3.mm.bing.net/th/id/OIP.L3TMT9mYqRVb07F2RnMPzQHaEK?pid=Api&P=0&h=180" alt="local market" />
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="categories">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search local goods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Festival Offers */}
      <div className="offers fade-in">
        <h2>🎉 Festival Deals</h2>
        <div className="offer-banner">
          <p>Get up to <span>30% OFF</span> on Handmade Items!</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {visibleProducts.map((product, idx) => (
          <div key={product.id} className="product-card animated-card" style={{ animationDelay: `${idx * 0.1}s` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Load More */}
      {!search && visibleCount < filteredProducts.length && (
        <div className="load-more-container">
          <button className="load-btn" onClick={() => setVisibleCount(visibleCount + 6)}>
            Load More
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Home;
