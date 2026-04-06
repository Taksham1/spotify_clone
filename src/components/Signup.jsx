import React, { useState } from 'react';
import API_URL from '../config';

const Signup = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    method: 'email' // 'email' or 'whatsapp'
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const target = formData.method === 'email' ? formData.email : formData.phone;
    if (!target) {
      setError(`Please provide your ${formData.method === 'email' ? 'email' : 'phone number'}`);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: formData.method, target })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      console.log("OTP Sent via Live Email");
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifySignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const target = formData.method === 'email' ? formData.email : formData.phone;

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, target, otp })
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
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, textAlign: 'center', maxWidth: '450px' }}>
          {step === 1 ? 'Sign up for free' : step === 2 ? 'Verify OTP' : 'Success!'}
        </h1>
        
        <div style={{ width: '100%', maxWidth: '324px' }}>
        
        {error && <div style={{ color: '#e22134', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Name</label>
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="auth-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="auth-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required className="auth-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Phone Number (WhatsApp)</label>
              <input type="tel" name="phone" placeholder="+1234567890" value={formData.phone} onChange={handleChange} required className="auth-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Password</label>
              <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required className="auth-input" />
            </div>
            
            <div style={{ display: 'none' }}>
              <input type="radio" name="method" value="email" checked={true} readOnly />
            </div>

            <button type="submit" disabled={loading} className="upgrade-btn" style={{ padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-subdued)' }}>Already have an account? </span>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} style={{ color: 'white', textDecoration: 'underline' }}>Log in</a>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifySignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-subdued)' }}>
              We sent a 6-digit code to your {formData.method}. Please enter it below.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700 }}>OTP Code</label>
              <input type="text" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required className="auth-input" style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <button type="submit" disabled={loading} className="upgrade-btn" style={{ padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              {loading ? 'Verifying...' : 'Sign Up'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', marginTop: '8px' }}>Back</button>
          </form>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--essential-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" style={{ width: '40px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p style={{ textAlign: 'center', fontSize: '18px' }}>Your account has been created!</p>
            <button onClick={() => onNavigate('login')} className="upgrade-btn" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '16px', borderRadius: '500px' }}>
              Proceed to Log in
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
