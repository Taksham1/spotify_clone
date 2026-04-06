import React, { createContext, useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import PlayerBar from './components/PlayerBar';
import AuthManager from './components/AuthManager';
import AdminPanel from './components/AdminPanel';
import SearchView from './components/SearchView';
import PlaylistView from './components/PlaylistView';
import { Home, Search, Library, Settings } from 'lucide-react';
import API_URL from './config';
import './index.css';

export const PlayerContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [songs, setSongs] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'admin' | 'search' | 'playlist'
  const [activePlaylistId, setActivePlaylistId] = useState(null); // 'liked' or integer
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  
  const playerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/users/${user.id}/playlists`)
        .then(res => res.json())
        .then(data => setPlaylists(data.playlists))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    fetch(`${API_URL}/api/songs`)
      .then(res => res.json())
      .then(data => setSongs(data.songs))
      .catch(err => console.error("Error fetching songs:", err));
  }, []);

  const currentTrack = songs[currentTrackIndex] || null;
  const isMp3 = currentTrack && currentTrack.audioSrc && currentTrack.audioSrc.includes('.mp3');

  useEffect(() => {
    if (isMp3 && audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.error("Audio play error:", e));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, isMp3]);

  useEffect(() => {
    if (isMp3 && audioRef.current) {
       audioRef.current.volume = volume;
    }
  }, [volume, isMp3]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);
  
  const nextTrack = () => {
    if(songs.length === 0) return;
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * songs.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % songs.length);
    }
    setIsPlaying(true);
  };
  const prevTrack = () => {
    if(songs.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };
  const handleProgress = (state) => {
    // For ReactPlayer
    if (state && state.playedSeconds !== undefined) {
       setProgress(state.playedSeconds);
    }
  };
  const handleDuration = (dur) => setDuration(dur);
  const seekTo = (time) => {
    if (playerRef.current) playerRef.current.seekTo(time, 'seconds');
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  };
  const handleEnded = () => {
    if (isRepeat) {
      if (playerRef.current) playerRef.current.seekTo(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setIsPlaying(true);
    } else {
      nextTrack();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsPlaying(false);
    setActiveTab('home');
  };

  if (!user) {
    return <AuthManager onLogin={setUser} />;
  }

  return (
    <PlayerContext.Provider
      value={{
        user,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        progress,
        duration,
        volume,
        setVolume,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        seekTo,
        isShuffle,
        isRepeat,
        toggleShuffle,
        toggleRepeat,
        setSongs,
        playlists,
        setPlaylists,
      }}
    >
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} setActivePlaylistId={setActivePlaylistId} />
        
        <div style={{gridArea: 'main', backgroundColor: 'var(--bg-highlight)', borderRadius: 'var(--border-radius)', overflowY: 'auto', position: 'relative'}}>
            {activeTab === 'home' ? (
               <MainView songs={songs} />
            ) : activeTab === 'admin' ? (
               <AdminPanel />
            ) : activeTab === 'search' ? (
               <SearchView songs={songs} setSongs={setSongs} />
            ) : activeTab === 'playlist' ? (
               <PlaylistView playlistId={activePlaylistId} songs={songs} setSongs={setSongs} />
            ) : null}
        </div>
        
        <PlayerBar />

        {/* Mobile bottom navigation (replaces sidebar on small screens) */}
        <nav className="mobile-nav">
          <button className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={22} />
            <span>Home</span>
          </button>
          <button className={`mobile-nav-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <Search size={22} />
            <span>Search</span>
          </button>
          <button className={`mobile-nav-btn ${activeTab === 'playlist' ? 'active' : ''}`} onClick={() => { setActiveTab('playlist'); setActivePlaylistId('liked'); }}>
            <Library size={22} />
            <span>Library</span>
          </button>
          {user?.role === 'admin' && (
            <button className={`mobile-nav-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Settings size={22} />
              <span>Admin</span>
            </button>
          )}
        </nav>
        
        {isMp3 && (
           <audio 
             ref={audioRef}
             src={currentTrack.audioSrc} 
             onTimeUpdate={(e) => setProgress(e.target.currentTime)}
             onLoadedMetadata={(e) => setDuration(e.target.duration)}
             onEnded={handleEnded}
             muted={volume === 0}
             style={{ display: 'none' }}
           />
        )}

        {!isMp3 && currentTrack && (
           <ReactPlayer 
             ref={playerRef}
             url={currentTrack.audioSrc} 
             playing={isPlaying} 
             volume={volume}
             muted={volume === 0}
             onProgress={handleProgress}
             onDuration={handleDuration}
             onEnded={handleEnded}
             style={{ position: 'absolute', opacity: 0.01, pointerEvents: 'auto', zIndex: -100 }}
             width="1px"
             height="1px"
             config={{ 
               youtube: { 
                 playerVars: { 
                   origin: window.location.origin,
                   autoplay: 1
                 } 
               } 
             }}
           />
        )}
      </div>
    </PlayerContext.Provider>
  );
}

export default App;
