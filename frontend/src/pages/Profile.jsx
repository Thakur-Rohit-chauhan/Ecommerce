import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Profile() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+91 9876543210',
  });

  const [orders] = useState([
    { id: 'ORD123', item: 'Smartphone XYZ', price: 14999, status: 'Delivered' },
    { id: 'ORD124', item: 'Laptop ABC', price: 55999, status: 'Shipped' },
  ]);

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: '123, MG Road, Mumbai, Maharashtra' },
    { id: 2, label: 'Office', address: '456, Business Park, Pune, Maharashtra' },
  ]);

  // Modals
  const [editProfile, setEditProfile] = useState(false);
  const [addAddress, setAddAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Handlers
  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address) {
      setAddresses([...addresses, { id: Date.now(), ...newAddress }]);
      setNewAddress({ label: '', address: '' });
      setAddAddress(false);
    }
  };

  const handleEditAddress = () => {
    if (editAddress.label && editAddress.address) {
      setAddresses(addresses.map(a => a.id === editAddress.id ? editAddress : a));
      setEditAddress(null);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleChangePassword = () => {
    if (passwords.newPassword === passwords.confirmPassword) {
      alert('Password changed successfully!');
      setChangePassword(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      alert('New password and confirm password do not match.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>My Profile</h1>

        {/* User Info */}
        <div style={styles.section}>
          <h2>User Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <button style={styles.button} onClick={() => setEditProfile(true)}>Edit Profile</button>
        </div>

        {/* Edit Profile Modal */}
        {editProfile && (
          <div style={styles.modal}>
            <h3>Edit Profile</h3>
            <input placeholder="Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} style={styles.input} />
            <input placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} style={styles.input} />
            <input placeholder="Phone" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} style={styles.input} />
            <div style={styles.modalButtons}>
              <button style={styles.button} onClick={() => setEditProfile(false)}>Save</button>
              <button style={styles.buttonSecondary} onClick={() => setEditProfile(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Orders */}
        <div style={styles.section}>
          <h2>My Orders</h2>
          {orders.map((o) => (
            <div key={o.id} style={styles.card}>
              <p><strong>Order ID:</strong> {o.id}</p>
              <p><strong>Item:</strong> {o.item}</p>
              <p><strong>Price:</strong> ₹{o.price}</p>
              <p><strong>Status:</strong> {o.status}</p>
            </div>
          ))}
        </div>

        {/* Addresses */}
        <div style={styles.section}>
          <h2>Addresses</h2>
          {addresses.map((a) => (
            <div key={a.id} style={styles.card}>
              <p><strong>{a.label}:</strong> {a.address}</p>
              <button style={styles.buttonSecondary} onClick={() => setEditAddress(a)}>Edit</button>
              <button style={styles.buttonSecondary} onClick={() => handleDeleteAddress(a.id)}>Delete</button>
            </div>
          ))}
          <button style={styles.button} onClick={() => setAddAddress(true)}>Add New Address</button>

          {/* Add Address Modal */}
          {addAddress && (
            <div style={styles.modal}>
              <h3>Add Address</h3>
              <input placeholder="Label (Home/Office)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} style={styles.input} />
              <input placeholder="Address" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} style={styles.input} />
              <div style={styles.modalButtons}>
                <button style={styles.button} onClick={handleAddAddress}>Save</button>
                <button style={styles.buttonSecondary} onClick={() => setAddAddress(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Edit Address Modal */}
          {editAddress && (
            <div style={styles.modal}>
              <h3>Edit Address</h3>
              <input placeholder="Label" value={editAddress.label} onChange={(e) => setEditAddress({ ...editAddress, label: e.target.value })} style={styles.input} />
              <input placeholder="Address" value={editAddress.address} onChange={(e) => setEditAddress({ ...editAddress, address: e.target.value })} style={styles.input} />
              <div style={styles.modalButtons}>
                <button style={styles.button} onClick={handleEditAddress}>Save</button>
                <button style={styles.buttonSecondary} onClick={() => setEditAddress(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div style={styles.section}>
          <h2>Settings</h2>
          <button style={styles.button} onClick={() => setChangePassword(true)}>Change Password</button>

          {/* Change Password Modal */}
          {changePassword && (
            <div style={styles.modal}>
              <h3>Change Password</h3>
              <input type="password" placeholder="Old Password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} style={styles.input} />
              <input type="password" placeholder="New Password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} style={styles.input} />
              <input type="password" placeholder="Confirm Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} style={styles.input} />
              <div style={styles.modalButtons}>
                <button style={styles.button} onClick={handleChangePassword}>Save</button>
                <button style={styles.buttonSecondary} onClick={() => setChangePassword(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  section: { marginBottom: '2rem' },
  card: { border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' },
  button: { padding: '0.6rem 1.2rem', backgroundColor: '#ffcc00', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' },
  buttonSecondary: { padding: '0.4rem 0.8rem', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem', marginRight: '0.5rem' },
  modal: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', zIndex: 1000,
    width: '90%', maxWidth: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  },
  input: { width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  modalButtons: { display: 'flex', justifyContent: 'space-between' },
};

export default Profile;
