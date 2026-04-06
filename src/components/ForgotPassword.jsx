import React, { useState } from 'react';
import API_URL from '../config';

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier) {
       setError("Please enter your email or phone number.");
       return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      console.log("SIMULATED RESET TOKEN:", data.simulated_token);
      alert(`[SIMULATION] Check console or here is your Reset Token: ${data.simulated_token}`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!token || !newPassword) {
       setError("Please enter the token and your new password.");
       return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(rgba(0,0,0,0.8), #000000) center center / cover no-repeat',
      color: 'white',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: '#121212',
        borderRadius: '12px',
        padding: '48px 32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
          {step === 1 ? 'Reset Password' : step === 2 ? 'Check your messages' : 'Password Reset!'}
        </h2>
        
        {error && <div style={{ color: '#e22134', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-subdued)', textAlign: 'center' }}>Enter the email address or phone number linked to your account.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Email Address or Phone Number</label>
              <input type="text" placeholder="Email or Phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="auth-input" />
            </div>
            <button type="submit" disabled={loading} className="upgrade-btn" style={{ padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              {loading ? 'Sending link...' : 'Send Reset Token'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-subdued)' }}>Remember your password? </span>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} style={{ color: 'white', textDecoration: 'underline' }}>Log in</a>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-subdued)' }}>
              We sent a 6-digit confirmation token manually required to reset your password.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Reset Token</label>
              <input type="text" maxLength={6} placeholder="123456" value={token} onChange={(e) => setToken(e.target.value)} required className="auth-input" style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>New Password</label>
              <input type="password" placeholder="Create new strong password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="auth-input" />
            </div>
            <button type="submit" disabled={loading} className="upgrade-btn" style={{ padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              {loading ? 'Resetting...' : 'Set new password'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', marginTop: '8px' }}>Cancel</button>
          </form>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--essential-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" style={{ width: '40px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p style={{ textAlign: 'center', fontSize: '18px' }}>Password updated successfully.</p>
            <button onClick={() => onNavigate('login')} className="upgrade-btn" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              Go back to Log in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
