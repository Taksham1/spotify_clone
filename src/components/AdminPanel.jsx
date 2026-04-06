import React, { useEffect, useState } from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';
import API_URL from '../config';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTypeChange = async (userId, newType) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/type`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, type: newType } : u));
      } else {
        alert("Failed to update user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{padding: '24px'}}>Loading users...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldAlert size={28} color="var(--essential-bright)" />
        Admin Dashboard
      </h2>
      <p style={{ color: 'var(--text-subdued)', marginBottom: '32px' }}>
        Manage user access levels. Only Admins can see this view.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--decorative-subdued)', color: 'var(--text-subdued)', fontSize: '14px', textTransform: 'uppercase' }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Account Type</span>
          <span>Action</span>
        </div>
        
        {users.map(user => (
          <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '16px', backgroundColor: 'var(--bg-highlight)', borderRadius: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>{user.name} <UserCheck size={14} style={{display: 'inline', marginLeft: '4px', opacity: 0.5}} /></span>
            <span style={{ fontSize: '13px', color: 'var(--text-subdued)' }}>{user.email || 'N/A'}</span>
            <span>{user.role}</span>
            <span style={{ color: user.type === 'premium' ? 'var(--essential-bright)' : 'var(--text-subdued)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>
              {user.type}
            </span>
            <div>
              {user.role !== 'admin' && (
                <button 
                  onClick={() => handleTypeChange(user.id, user.type === 'premium' ? 'free' : 'premium')}
                  style={{
                    backgroundColor: user.type === 'free' ? 'var(--essential-bright)' : 'transparent',
                    color: user.type === 'free' ? 'black' : 'white',
                    border: user.type === 'free' ? 'none' : '1px solid var(--decorative-subdued)',
                    padding: '8px 16px',
                    borderRadius: '500px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  {user.type === 'premium' ? 'Revoke Premium' : 'Make Premium'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
