import React, { useContext, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Clock3, UserCircle, Bell, Heart, Trash2 } from 'lucide-react';
import { PlayerContext } from '../App';
import API_URL from '../config';

const PlaylistView = ({ playlistId, songs: contextSongs, setSongs }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, user } = useContext(PlayerContext);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState({ name: 'Loading...', isLiked: false });
  const [headerColor, setHeaderColor] = useState('#5e69e8');
  const mainRef = useRef(null);
  
  const colors = ['#2b6875', '#1a542b', '#7a2828', '#9e6d24', '#5e69e8'];

  const fetchPlaylistData = async () => {
    try {
      if (playlistId === 'liked') {
        const res = await fetch(`${API_URL}/api/users/${user.id}/liked_songs`);
        const data = await res.json();
        setPlaylistSongs(data.songs || []);
        setPlaylistInfo({ name: 'Liked Songs', isLiked: true });
        setHeaderColor('#450af5');
      } else {
        // Fetch playlist details
        const detailsRes = await fetch(`${API_URL}/api/playlists/${playlistId}`);
        const detailsData = await detailsRes.json();
        setPlaylistInfo({ name: detailsData.playlist?.name || 'Unknown Playlist', isLiked: false });
        
        // Fetch songs
        const res = await fetch(`${API_URL}/api/playlists/${playlistId}/songs`);
        const data = await res.json();
        setPlaylistSongs(data.songs || []);
        setHeaderColor(colors[playlistId % colors.length]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId, user.id]);

  const removeSong = async (e, songId) => {
    e.stopPropagation();
    try {
      if (playlistId === 'liked') {
        await fetch(`${API_URL}/api/users/${user.id}/liked_songs/${songId}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_URL}/api/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' });
      }
      // Re-fetch or filter
      setPlaylistSongs(prev => prev.filter(s => s.id !== songId));
      
      // Also update context if this was the active queue
      if (contextSongs.some(s => s.id === songId) && contextSongs.length === playlistSongs.length) {
         setSongs(prev => prev.filter(s => s.id !== songId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayRow = (index) => {
    // If we click a row, we should set the app queue to this playlist's songs
    // and play from that index
    setSongs(playlistSongs);
    playTrack(index);
  };

  const handleActionPlay = () => {
    if (playlistSongs.length === 0) return;
    
    // Check if we are already playing this playlist
    const isCurrentlyPlayingThis = contextSongs.length > 0 && contextSongs[0].id === playlistSongs[0]?.id;
    
    if (isCurrentlyPlayingThis) {
      togglePlay();
    } else {
      setSongs(playlistSongs);
      playTrack(0);
    }
  };

  const isCurrentlyPlayingThisPlaylist = contextSongs.length > 0 && contextSongs[0]?.id === playlistSongs[0]?.id;

  return (
    <div className="main-view-inner" ref={mainRef} style={{ '--header-color': headerColor, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div className="main-header-gradient" style={{position: 'absolute', height: '330px'}}></div>

      <div className="main-top-bar" style={{position: 'sticky', top: 0, zIndex: 10}}>
        <div className="nav-buttons">
          <button className="nav-btn"><ChevronLeft size={20} /></button>
          <button className="nav-btn"><ChevronRight size={20} color="var(--text-subdued)" /></button>
        </div>
        
        <div className="user-controls">
          <div className="user-avatar" style={{cursor: 'pointer'}}>
            <UserCircle size={24} />
          </div>
        </div>
      </div>

      <div className="main-content" style={{marginTop: '100px'}}>
        <div className="header-banner">
          {playlistInfo.isLiked ? (
            <div style={{ width: '232px', height: '232px', background: 'linear-gradient(135deg, #450af5, #c4efd9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>
               <Heart size={64} fill="white" color="white" />
            </div>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300" // placeholder for playlist art
              alt="Playlist" 
              className="header-image" 
            />
          )}
          
          <div className="header-info">
            <span className="header-type">Playlist</span>
            <h1 className="header-title" style={{ fontSize: '72px', margin: '0.08em 0', letterSpacing: '-0.04em' }}>{playlistInfo.name}</h1>
            <span className="header-meta" style={{ fontWeight: 700, color: 'white' }}>{user.name} <span style={{color: 'var(--text-subdued)', fontWeight: 400}}>• {playlistSongs.length} songs</span></span>
          </div>
        </div>

        <div className="action-bar">
          <button className="play-action-btn" onClick={handleActionPlay}>
             {isCurrentlyPlayingThisPlaylist && isPlaying ? <Pause size={28} weight="fill" fill="black" /> : <Play size={28} weight="fill" fill="black" style={{marginLeft: '4px'}} />}
          </button>
        </div>

        <div className="track-list">
          {playlistSongs.length > 0 && (
            <div className="track-list-header" style={{gridTemplateColumns: '50px minmax(130px, 1fr) 200px 50px 50px'}}>
              <div>#</div>
              <div>Title</div>
              <div>Album</div>
              <div></div>
              <div style={{textAlign: 'right', paddingRight: '16px'}}><Clock3 size={16} /></div>
            </div>
          )}

          <div className="track-list-body">
            {playlistSongs.map((song, index) => {
               const isCurrentlyPlaying = currentTrack?.id === song.id;
               
               return (
                 <div 
                   key={song.id} 
                   className={`track-row ${isCurrentlyPlaying ? 'playing' : ''}`}
                   onClick={() => isCurrentlyPlaying ? togglePlay() : handlePlayRow(index)}
                   style={{gridTemplateColumns: '50px minmax(130px, 1fr) 200px 50px 50px'}}
                 >
                   <div className="track-num">
                     {isCurrentlyPlaying && isPlaying ? (
                       <div className="playing-icon">
                         <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
                       </div>
                     ) : isCurrentlyPlaying && !isPlaying ? (
                       <span style={{color: 'var(--essential-bright)'}}>{index + 1}</span>
                     ) : (
                       <span>{index + 1}</span>
                     )}
                   </div>
                   
                   <div className="track-info">
                     <img src={song.albumArt} alt={song.title} className="track-img" />
                     <div className="track-details">
                       <span className="track-title">{song.title}</span>
                       <span className="track-artist">{song.artist}</span>
                     </div>
                   </div>

                   <div className="track-album">{song.album}</div>
                   
                   <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <button 
                       onClick={(e) => removeSong(e, song.id)}
                       style={{ background: 'transparent', border: 'none', color: 'var(--text-subdued)', cursor: 'pointer'}}
                       title="Remove song"
                       className="hover-bright"
                     >
                        <Trash2 size={18} />
                     </button>
                   </div>
                   
                   <div className="track-duration">{song.duration}</div>
                 </div>
               );
            })}
          </div>
          
          {playlistSongs.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subdued)' }}>
               No songs added yet. Go to Search to add some!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
