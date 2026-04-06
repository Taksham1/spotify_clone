import React, { useState } from 'react';
import API_URL from '../config';

const Login = ({ onLogin, onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(rgba(0,0,0,0.8) 0%, #121212 100%)',
      color: 'white',
      padding: '32px 24px'
    }}>
      <div style={{ paddingBottom: '32px', paddingTop: '16px' }}>
        <img
          src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png"
          alt="Spotify"
          style={{ height: '40px' }}
        />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '734px',
        backgroundColor: '#000000',
        borderRadius: '8px',
        padding: '72px 0 112px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, textAlign: 'center', maxWidth: '450px' }}>Log in to Spotify</h1>
        <div style={{ fontSize: '14px', color: 'var(--text-subdued)', textAlign: 'center' }}>
        </div>

        <div style={{ width: '100%', maxWidth: '324px' }}>

          {error && <div style={{ color: '#e22134', backgroundColor: 'rgba(226, 33, 52, 0.1)', padding: '12px', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Email Address or Phone Number</label>
              <input
                type="text"
                placeholder="Email or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            <button type="submit" disabled={loading} className="upgrade-btn" style={{ padding: '16px', fontSize: '16px', borderRadius: '500px', marginTop: '16px' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forgot_password'); }} style={{ color: 'white', textDecoration: 'underline' }}>Forgot your password?</a>
          </div>

          <div style={{ height: '1px', backgroundColor: '#2a2a2a', margin: '8px 0' }}></div>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-subdued)' }}>Don't have an account? </span>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }} style={{ color: 'white', textDecoration: 'underline' }}>Sign up for Spotify</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
