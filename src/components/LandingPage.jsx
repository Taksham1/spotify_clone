import React, { useState, useEffect } from 'react';

const LandingPage = ({ onNavigate }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#000000',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* Dynamic Animated Images Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Floating animated blobs and images */}
        <div className="animated-blob" style={{
          position: 'absolute',
          top: '-10%', left: '-10%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(29,185,84,0.3) 0%, rgba(0,0,0,0) 70%)',
          animation: 'float 10s ease-in-out infinite'
        }}></div>
        <div className="animated-blob" style={{
          position: 'absolute',
          bottom: '-20%', right: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(138,43,226,0.2) 0%, rgba(0,0,0,0) 70%)',
          animation: 'float-reverse 15s ease-in-out infinite'
        }}></div>
        
        {/* Floating Album Arts */}
        <img 
          src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&h=300" 
          alt="Album"
          style={{
            position: 'absolute', top: '15%', left: '10%',
            width: '180px', borderRadius: '12px', opacity: 0.5,
            transform: `translateY(${scrollY * 0.2}px) rotate(-15deg)`,
            animation: 'breathe 8s infinite alternate'
          }} 
        />
        <img 
          src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=300&h=300" 
          alt="Album"
          style={{
            position: 'absolute', top: '45%', right: '15%',
            width: '220px', borderRadius: '12px', opacity: 0.5,
            transform: `translateY(${scrollY * -0.3}px) rotate(10deg)`,
            animation: 'breathe-reverse 10s infinite alternate'
          }} 
        />
      </div>
      
      {/* Official Spotify Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <img 
          src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" 
          alt="Spotify" 
          style={{ height: '36px', cursor: 'pointer' }} 
        />
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center', fontWeight: 700, fontSize: '16px' }}>
          <span style={{ cursor: 'pointer' }} className="hover-white">Premium</span>
          <span style={{ cursor: 'pointer' }} className="hover-white">Support</span>
          <span style={{ cursor: 'pointer' }} className="hover-white">Download</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--text-base)' }}></div>
          <span style={{ cursor: 'pointer', color: 'var(--text-subdued)' }} className="hover-white" onClick={() => onNavigate('signup')}>Sign up</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-subdued)' }} className="hover-white" onClick={() => onNavigate('login')}>Log in</span>
        </nav>
      </header>
      
      {/* Global CSS for the Hover Text used in the Header */}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-white { transition: color 0.2s; color: white; }
        .hover-white:hover { color: var(--essential-bright) !important; }
      `}} />

      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        textAlign: 'center',
        padding: '0 24px'
      }}>
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 900,
          background: 'linear-gradient(to right, #1db954, #8a2be2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px',
          letterSpacing: '-2px',
          animation: 'scaleIn 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          Music for everyone.
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-subdued)',
          maxWidth: '600px',
          marginBottom: '64px',
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.5s both'
        }}>
          Millions of songs. No credit card needed. Experience high fidelity streaming wrapped in a stunning modern interface. Sign up or log in to continue.
        </p>

        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          <button 
            onClick={() => onNavigate('signup')}
            style={{
              padding: '18px 48px',
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: '500px',
              backgroundColor: 'var(--essential-bright)',
              color: 'black',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, background-color 0.2s',
              boxShadow: '0 8px 24px rgba(29, 185, 84, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Sign Up Free
          </button>
          <button 
            onClick={() => onNavigate('login')}
            style={{
              padding: '18px 48px',
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: '500px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              cursor: 'pointer',
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
