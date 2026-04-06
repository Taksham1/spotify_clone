import React, { useContext, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Clock3, UserCircle, Bell, DownloadCloud, Plus } from 'lucide-react';
import { PlayerContext } from '../App';
import API_URL from '../config';

const MainView = ({ songs }) => {
  const { currentTrackIndex, isPlaying, playTrack, togglePlay, user, playlists, setSongs } = useContext(PlayerContext);
  const [headerColor, setHeaderColor] = useState('#5e69e8');
  const mainRef = useRef(null);
  
  const colors = ['#5e69e8', '#1a542b', '#7a2828', '#9e6d24', '#2b6875'];

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    // Fetch real-time trending songs from our backend
    const fetchTrending = async () => {
      try {
         const res = await fetch(`${API_URL}/api/trending`);
         if (res.ok) {
            const data = await res.json();
            setTrendingSongs(data.results);
         }
      } catch (err) {
         console.error("Failed to fetch trending songs:", err);
      } finally {
         setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCardPlay = async (sourceSong, isTrending = false) => {
    if (isTrending) {
       let realIndex = songs.findIndex(s => s.id === sourceSong.id);
       if (realIndex === -1) {
          const updatedSongs = [...songs, sourceSong];
          setSongs(updatedSongs);
          realIndex = updatedSongs.length - 1;
       }
       
       // Add an artificial small timeout if array was just mutated, though React batching usually handles it properly.
       setTimeout(() => {
         if (currentTrackIndex === realIndex && isPlaying) {
           togglePlay();
         } else {
           playTrack(realIndex);
         }
       }, 0);
       return;
    }

    const realIndex = songs.findIndex(s => s.id === sourceSong.id);
    if (realIndex === -1) return;

    if (currentTrackIndex === realIndex && isPlaying) {
      togglePlay();
    } else {
      playTrack(realIndex);
    }
  };

  // Shuffle array helper for different rows
  const getShuffled = (arr, seed) => {
    let result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = (i + seed) % result.length;
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  return (
    <div className="main-view-inner" ref={mainRef} style={{ '--header-color': headerColor, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div className="main-header-gradient" style={{position: 'absolute', height: '330px', transition: 'background 1s ease'}}></div>

      <div className="main-top-bar" style={{position: 'sticky', top: 0, zIndex: 10}}>
        <div className="nav-buttons">
          <button className="nav-btn"><ChevronLeft size={20} /></button>
          <button className="nav-btn"><ChevronRight size={20} color="var(--text-subdued)" /></button>
        </div>
        
        <div className="user-controls">
          {user.type === 'free' && (
             <button className="upgrade-btn" onClick={() => alert('Contact Admin to change to Premium.')}>Explore Premium</button>
          )}
          <div style={{color: 'white', fontWeight: 'bold', fontSize: '14px', marginRight: '8px', cursor: 'pointer'}} title={`Role: ${user.role} | Type: ${user.type}`}>
            {user.name} <span style={{fontSize: '10px', verticalAlign: 'top', color: user.type === 'premium'? 'var(--essential-bright)' : 'gray'}}>{user.type.toUpperCase()}</span>
          </div>
          <button className="nav-btn"><Bell size={18} /></button>
          <div className="user-avatar" style={{cursor: 'pointer'}}>
            <UserCircle size={24} />
          </div>
        </div>
      </div>

      <div className="main-content" style={{marginTop: '60px', padding: '24px', zIndex: 2}}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px' }}>{getGreeting()}</h1>
        
        {/* Songs for You (Trending from YouTube) */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Songs for You</h2>
             <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-subdued)', cursor: 'pointer' }} className="hover-white">SEE MORE</span>
          </div>
          
          {loadingTrending ? (
             <div style={{ color: 'var(--text-subdued)' }}>Loading trending tracks from around the world...</div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gridAutoFlow: 'row', 
              columnGap: '24px', 
              rowGap: '16px' 
            }}>
              {trendingSongs.slice(0, 12).map((song) => {
                return (
                  <div 
                    key={song.id}
                    onClick={() => handleCardPlay(song, true)}
                    style={{
                      backgroundColor: 'transparent',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                       <img src={song.albumArt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={song.title} />
                       <div style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s'
                       }} className="play-overlay">
                          <Play size={20} fill="white" />
                       </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-subdued)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Your Frequent Plays */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Your Frequent Plays</h2>
             <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-subdued)', cursor: 'pointer' }} className="hover-white">SEE MORE</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
            {getShuffled(songs, 3).slice(0, 6).map((song) => {
              const realIndex = songs.findIndex(s => s.id === song.id);
              const isCardPlaying = currentTrackIndex === realIndex && isPlaying;
              
              return (
                <div 
                  key={"freq-" + song.id}
                  onClick={() => handleCardPlay(song, false)}
                  style={{
                    backgroundColor: '#181818',
                    padding: '16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#282828'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#181818'}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                     <img src={song.albumArt} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={song.title} />
                     
                     <div style={{
                        position: 'absolute', bottom: '8px', right: '8px', width: '48px', height: '48px', 
                        borderRadius: '50%', backgroundColor: 'var(--essential-bright)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
                        opacity: isCardPlaying ? 1 : 0,
                        transition: 'all 0.3s ease',
                     }} className="play-hover-btn">
                       {isCardPlaying ? (
                         <div className="playing-icon" style={{ transform: 'scale(0.8)' }}>
                           <div className="bar" style={{backgroundColor: 'black'}}></div><div className="bar" style={{backgroundColor: 'black'}}></div><div className="bar" style={{backgroundColor: 'black'}}></div>
                         </div>
                       ) : (
                         <Play size={24} fill="black" style={{ marginLeft: '4px' }} />
                       )}
                     </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-subdued)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Artist</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      
      {/* Global CSS to handle play button appearing on hover over the card */}
      <style dangerouslySetInnerHTML={{__html: `
        .main-content > div > div > div:hover .play-hover-btn,
        .main-content > div > div > div:hover .play-overlay {
           opacity: 1 !important;
           transform: translateY(0) !important;
        }
        .main-content h2:hover {
           text-decoration: underline;
           cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default MainView;
