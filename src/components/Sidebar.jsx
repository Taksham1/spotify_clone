import React, { useContext, useEffect, useState } from 'react';
import { Home, Search, Library, PlusSquare, Heart, Settings, LogOut } from 'lucide-react';
import { PlayerContext } from '../App';
import API_URL from '../config';

const Sidebar = ({ activeTab, setActiveTab, onLogout, setActivePlaylistId }) => {
  const { user, playlists, setPlaylists } = useContext(PlayerContext);

  const handleCreatePlaylist = async () => {
    if (user.type !== 'premium') {
      alert("Enjoy creating playlists? Upgrade to Spotify Premium today!");
      return;
    }
    
    const name = prompt("Enter playlist name:");
    if (!name) return;

    try {
      const res = await fetch(`${API_URL}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: user.id, userType: user.type })
      });
      const data = await res.json();
      if (res.ok) {
         setPlaylists([...playlists, { id: data.id, name: data.name }]);
      } else {
         alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sidebar" style={{overflowY: 'auto', gap: '8px', padding: '0 8px', marginTop: '8px'}}>
      
      {/* Top Panel */}
      <div className="sidebar-panel" style={{ padding: '20px 24px', backgroundColor: '#121212' }}>
        <div style={{ marginBottom: '24px', paddingLeft: '4px' }}>
          <img 
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" 
            alt="Spotify" 
            style={{ height: '24px', width: 'auto' }} 
          />
        </div>
        <ul className="nav-links">
          <li onClick={() => setActiveTab('home')}>
            <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} style={{ fontSize: '16px', fontWeight: 700, gap: '20px' }}>
              <Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
              Home
            </a>
          </li>
          <li onClick={() => setActiveTab('search')} style={{ marginTop: '8px' }}>
            <a href="#" className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} style={{ fontSize: '16px', fontWeight: 700, gap: '20px' }}>
              <Search size={28} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
              Search
            </a>
          </li>
          {user.role === 'admin' && (
            <li onClick={() => setActiveTab('admin')} style={{ marginTop: '8px' }}>
              <a href="#" className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} style={{color: activeTab === 'admin' ? 'var(--essential-bright)' : '', fontSize: '16px', fontWeight: 700, gap: '20px'}}>
                <Settings size={28} />
                Admin Panel
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Library Panel */}
      <div className="sidebar-panel library-panel" style={{flexGrow: 1, padding: '12px 16px', backgroundColor: '#121212'}}>
        <div className="library-header" style={{ padding: '8px 8px 16px', marginBottom: 0 }}>
          <div className="library-header-left" style={{ gap: '12px', fontSize: '16px' }}>
            <Library size={28} strokeWidth={2} fill="currentColor" opacity={0.7} />
            Your Library
          </div>
          <button 
             onClick={handleCreatePlaylist}
             style={{background: 'transparent', border: 'none', color: 'var(--text-subdued)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center'}} 
             title="Create playlist or folder"
             onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#242424'; }}
             onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-subdued)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <PlusSquare size={20} className="add-btn" />
          </button>
        </div>

        <ul className="playlists" style={{marginTop: '0px'}}>
          <li className={`playlist-item ${activeTab === 'playlist' && activePlaylistId === 'liked' ? 'active' : ''}`}
              style={{ background: activeTab === 'playlist' && activePlaylistId === 'liked' ? 'var(--bg-elevated)' : 'transparent', marginBottom: '8px' }} 
              onClick={() => { setActiveTab('playlist'); setActivePlaylistId('liked'); }}>
             <div style={{background: 'linear-gradient(135deg, #450af5, #c4efd9)', padding: '12px', borderRadius: '4px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <Heart size={20} color="white" fill="white" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-base)' }}>Liked Songs</span>
                <span style={{ fontSize: '14px', color: 'var(--text-subdued)' }}>Playlist • {user.name}</span>
             </div>
          </li>
          
          {playlists.map((pl) => (
            <li key={pl.id} className="playlist-item" style={{ background: activeTab === 'playlist' && activePlaylistId === pl.id ? 'var(--bg-elevated)' : 'transparent', marginBottom: '8px' }}
                onClick={() => { setActiveTab('playlist'); setActivePlaylistId(pl.id); }}>
              <div style={{ background: '#282828', width: '48px', height: '48px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Library size={24} color="#b3b3b3" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-base)' }}>{pl.name}</span>
                 <span style={{ fontSize: '14px', color: 'var(--text-subdued)' }}>Playlist • {user.name}</span>
              </div>
            </li>
          ))}
        </ul>
        
        <div style={{marginTop: 'auto', paddingTop: '16px'}}>
           <button onClick={onLogout} style={{display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: '1px solid var(--decorative-subdued)', borderRadius: '500px', padding: '8px 24px', color: 'white', cursor: 'pointer', fontWeight: 700, margin: '0 auto'}}>
              <LogOut size={16} /> Log out
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
