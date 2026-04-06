import React, { useState, useContext } from 'react';
import { Search as SearchIcon, Play, Pause, Clock3, Plus } from 'lucide-react';
import { PlayerContext } from '../App';
import API_URL from '../config';

const SearchView = ({ songs, setSongs }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, playlists } = useContext(PlayerContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const overridePlay = (song) => {
    // Inject the selected song into the global songs array and play it
    // if not already there, append it
    let index = songs.findIndex(s => s.id === song.id);
    if (index === -1) {
      setSongs([song, ...songs]);
      index = 0;
    }
    playTrack(index);
  };

  const handleAddToPlaylist = async (e, song) => {
    e.stopPropagation();
    if (!playlists || playlists.length === 0) {
      alert("Create a playlist first from the sidebar!");
      return;
    }
    const playlistOptions = playlists.map(p => `${p.id} - ${p.name}`).join('\n');
    const pid = prompt(`Enter the ID of the Playlist to add "${song.title}":\n\n${playlistOptions}`);
    if (!pid) return;
    
    try {
      const res = await fetch(`${API_URL}/api/playlists/${pid}/songs`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ song })
      });
      if (res.ok) alert("Added to playlist!");
      else alert("Failed to add.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', marginBottom: '32px', position: 'sticky', top: '16px', zIndex: 10 }}>
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <SearchIcon style={{ position: 'absolute', top: '12px', left: '16px', color: 'black' }} size={24} />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 14px 14px 50px', 
              borderRadius: '500px', 
              border: 'none', 
              fontSize: '16px', 
              color: 'black',
              fontWeight: 'bold',
              outline: 'none'
            }}
          />
        </div>
        <button type="submit" className="upgrade-btn">Search</button>
      </form>

      {loading && <div style={{ color: 'var(--text-subdued)' }}>Searching YouTube...</div>}

      <div className="track-list" style={{ flexGrow: 1 }}>
        {results.length > 0 && (
          <div className="track-list-header" style={{ gridTemplateColumns: '50px minmax(130px, 1fr) 200px 50px 50px' }}>
            <div>#</div><div>Title</div><div>Source</div><div></div><div style={{ textAlign: 'right', paddingRight: '16px' }}><Clock3 size={16} /></div>
          </div>
        )}

        <div className="track-list-body">
          {results.map((song, index) => {
             const isCurrentlyPlaying = currentTrack?.id === song.id;
             
             return (
               <div 
                 key={song.id} 
                 className={`track-row ${isCurrentlyPlaying ? 'playing' : ''}`}
                 onClick={() => isCurrentlyPlaying ? togglePlay() : overridePlay(song)}
                 style={{ gridTemplateColumns: '50px minmax(130px, 1fr) 200px 50px' }}
               >
                 <div className="track-num">
                   {isCurrentlyPlaying && isPlaying ? (
                     <div className="playing-icon">
                       <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
                     </div>
                   ) : isCurrentlyPlaying && !isPlaying ? (
                     <span style={{color: 'var(--essential-bright)'}}>{index + 1}</span>
                   ) : (
                     <img src={song.albumArt} alt={song.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                   )}
                 </div>
                 
                 <div className="track-info">
                   <div className="track-details" style={{marginLeft: isCurrentlyPlaying ? '48px' : '0px'}}>
                     <span className="track-title" style={{WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{song.title}</span>
                     <span className="track-artist">{song.artist}</span>
                   </div>
                 </div>

                 <div className="track-album" style={{ color: 'var(--text-subdued)' }}>{song.album}</div>                   
                 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <button 
                       onClick={(e) => handleAddToPlaylist(e, song)}
                       style={{ background: 'transparent', border: 'none', color: 'var(--text-subdued)', cursor: 'pointer'}}
                       title="Add to Playlist"
                       className="hover-bright"
                     >
                        <Plus size={18} />
                     </button>
                 </div>
                 <div className="track-duration" style={{ color: 'var(--text-subdued)', paddingRight: '16px' }}>{song.duration}</div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
