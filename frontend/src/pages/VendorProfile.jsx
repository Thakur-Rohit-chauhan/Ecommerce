import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

function VendorProfile() {
  const navigate = useNavigate();

  // Load vendor info from localStorage (dummy backend)
  const [vendor, setVendor] = useState({
    name: '',
    shopName: '',
    email: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('vendorData'));
    if (storedData) setVendor(storedData);
    else navigate('/vendorlogin'); // redirect if not logged in
  }, [navigate]);

  // Dummy vendor products
  const [products, setProducts] = useState([
  { id: 1, name: 'Smartphone XYZ', price: 14999, description: 'High-quality smartphone with 4GB RAM' },
  { id: 2, name: 'Laptop Ultra', price: 55999, description: 'Powerful laptop for gaming and work' },
  { id: 3, name: 'Wireless Headphones', price: 2999, description: 'Noise-cancelling, comfortable design' },
]);

  // Vendor handlers
  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    navigate('/');
  };

  const handleEditVendor = () => {
    const name = prompt('Your Name:', vendor.name) || vendor.name;
    const shopName = prompt('Shop Name:', vendor.shopName) || vendor.shopName;
    const email = prompt('Email:', vendor.email) || vendor.email;
    const address = prompt('Address:', vendor.address) || vendor.address;
    const phone = prompt('Phone:', vendor.phone) || vendor.phone;

    const updatedVendor = { ...vendor, name, shopName, email, address, phone };
    setVendor(updatedVendor);
    localStorage.setItem('vendorData', JSON.stringify(updatedVendor));
  };

  // Product handlers
  const handleAddProduct = () => {
  const name = prompt('Enter product name:');
  const price = prompt('Enter product price:');
  const description = prompt('Enter product description:');
  const image = prompt('Enter product image URL:'); // ✅ new

  if (name && price && description && image) {
    setProducts([
      ...products,
      { id: Date.now(), name, price: Number(price), description, image }
    ]);
  }
};

const handleEditProduct = (id) => {
  const product = products.find((p) => p.id === id);
  const name = prompt('Edit product name:', product.name) || product.name;
  const price = prompt('Edit product price:', product.price) || product.price;
  const description = prompt('Edit product description:', product.description) || product.description;
  const image = prompt('Edit product image URL:', product.image) || product.image;

  setProducts(
    products.map((p) =>
      p.id === id ? { ...p, name, price: Number(price), description, image } : p
    )
  );
};



  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <>
      <div style={styles.container}>
        <h1>Vendor Profile</h1>

        {/* Vendor Info */}
        <div style={styles.section}>
          <h2>Vendor Information</h2>
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Shop Name:</strong> {vendor.shopName}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>Address:</strong> {vendor.address}</p>
          <p><strong>Phone:</strong> {vendor.phone}</p>
          <button style={styles.editButton} onClick={handleEditVendor}>Edit Info</button>
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        </div>

        {/* Vendor Products */}
        <div style={styles.section}>
          <h2>My Products</h2>
          <button style={styles.addButton} onClick={handleAddProduct}>Add Product</button>
          {products.map((p) => (
  <div key={p.id} style={styles.productCard}>
     {/* ✅ new */}
    <div>
        <img src={p.image} alt={p.name} style={styles.productImage} />
      <p><strong>{p.name}</strong></p>
      <p>₹{p.price}</p>
      <p>{p.description}</p>
      <div>
        <button style={styles.editButton} onClick={() => handleEditProduct(p.id)}>Edit</button>
        <button style={styles.deleteButton} onClick={() => handleDeleteProduct(p.id)}>Delete</button>
      </div>
    </div>
  </div>
))}

        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
    productImage: { width: '100px', height: '100px', objectFit: 'cover', marginRight: '1rem', borderRadius: '6px' },

  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  section: { marginBottom: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' },
  logoutButton: { marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#ff4d4d', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' },
  editButton: { marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#00cc66', border: 'none', borderRadius: '6px', color: '#fff' },
  addButton: { marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#0077ff', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' },
  productCard: { border: '1px solid #ddd', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  deleteButton: { padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', marginLeft: '0.5rem' },
};

export default VendorProfile;
