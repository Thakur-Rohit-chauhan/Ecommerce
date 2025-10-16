import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const token = localStorage.getItem('authToken');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile.');
        const data = await res.json();
        setUser({
          id: data.id,
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          role: data.role || '',
        });
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Update profile
  const handleEditProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address,
        }),
      });
      if (!res.ok) throw new Error('Update failed.');
      alert('Profile updated!');
      setEditProfile(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New and confirm password do not match.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });
      if (!res.ok) throw new Error('Password change failed.');
      alert('Password changed!');
      setChangePassword(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>My Profile</h1>
        <div style={styles.section}>
          <h2>User Information</h2>
          <p><strong>Name:</strong> {user.full_name}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone_number}</p>
          <p><strong>Address:</strong> {user.address || 'No address added'}</p>
          <button style={styles.button} onClick={() => setEditProfile(true)}>Edit Profile</button>
        </div>

        {/* Edit Profile Modal */}
        {editProfile && (
          <div style={styles.modal}>
            <h3>Edit Profile</h3>
            <input placeholder="Name" value={user.full_name} onChange={(e) => setUser({ ...user, full_name: e.target.value })} style={styles.input} />
            <input placeholder="Username" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} style={styles.input} />
            <input placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} style={styles.input} />
            <input placeholder="Phone" value={user.phone_number} onChange={(e) => setUser({ ...user, phone_number: e.target.value })} style={styles.input} />
            <input placeholder="Address" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} style={styles.input} />
            <div style={styles.modalButtons}>
              <button style={styles.button} onClick={handleEditProfile}>Save</button>
              <button style={styles.buttonSecondary} onClick={() => setEditProfile(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={styles.section}>
          <h2>Settings</h2>
          <button style={styles.button} onClick={() => setChangePassword(true)}>Change Password</button>

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
