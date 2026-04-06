import React, { useContext, useState, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Mic2, LayoutList, Volume, Volume2, VolumeX, Maximize2, Heart, X
} from 'lucide-react';
import { PlayerContext } from '../App';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// ── Lyrics Modal ──────────────────────────────────────────────────────────────
const LyricsModal = ({ track, onClose }) => {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!track) return;
    setLoading(true);
    setLyrics(null);

    // Clean title from YouTube garbage (e.g. "(Official Video)", "[HD]")
    const cleanTitle = track.title
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .replace(/(official|video|audio|lyrics|hd|hq|mv|4k|ft\.|feat\..*)/gi, '')
      .trim();
    const artist = track.artist.replace(/\s*-\s*Topic\s*/gi, '').trim();

    fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(cleanTitle)}`)
      .then(r => r.json())
      .then(d => {
        setLyrics(d.lyrics || null);
        setLoading(false);
      })
      .catch(() => { setLyrics(null); setLoading(false); });
  }, [track]);

  return (
    <div className="lyrics-modal-overlay" onClick={onClose}>
      <div className="lyrics-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="lyrics-modal-header">
          <img src={track.albumArt} alt={track.title} className="lyrics-modal-art" />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {track.title}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-subdued)', marginTop: '4px' }}>
              {track.artist}
            </div>
          </div>
          <button className="lyrics-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="lyrics-modal-body">
          {loading && (
            <div className="lyrics-not-found">
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎵</div>
              Searching for lyrics...
            </div>
          )}
          {!loading && lyrics && (
            <pre className="lyrics-text">{lyrics}</pre>
          )}
          {!loading && !lyrics && (
            <div className="lyrics-not-found">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎼</div>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Lyrics not found</p>
              <p style={{ fontSize: '0.85rem' }}>
                Couldn't find lyrics for "{track.title}".<br />
                Try searching the song manually.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Volume Slider ─────────────────────────────────────────────────────────────
const VolumeSlider = ({ volume, setVolume }) => {
  const [prevVol, setPrevVol] = useState(0.5);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume : Volume2;

  const toggleMute = () => {
    if (volume > 0) { setPrevVol(volume); setVolume(0); }
    else setVolume(prevVol || 0.5);
  };

  const fillPercent = `${volume * 100}%`;

  return (
    <div className="volume-bar">
      <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'var(--text-subdued)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
        className="hover-bright">
        <VolumeIcon size={20} />
      </button>
      <div className="volume-slider-wrap">
        <div className="volume-track" />
        <div className="volume-fill" style={{ width: fillPercent }} />
        <div className="volume-thumb" style={{ left: fillPercent }} />
        <input
          className="volume-input"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

// ── Player Bar ────────────────────────────────────────────────────────────────
const PlayerBar = () => {
  const { 
    user, currentTrack, isPlaying, progress, duration, volume,
    setVolume, togglePlay, nextTrack, prevTrack, seekTo,
    isShuffle, isRepeat, toggleShuffle, toggleRepeat
  } = useContext(PlayerContext);

  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  React.useEffect(() => {
    if (!currentTrack || !user) return;
    import('../config').then(({ default: API_URL }) => {
      fetch(`${API_URL}/api/users/${user.id}/liked_songs`)
        .then(res => res.json())
        .then(data => {
          const liked = data.songs?.some(s => s.audioSrc === currentTrack.audioSrc);
          setIsLiked(!!liked);
        })
        .catch(console.error);
    });
  }, [currentTrack, user]);

  const handleLike = async () => {
    if (isLiked) return;
    try {
      const { default: API_URL } = await import('../config');
      const res = await fetch(`${API_URL}/api/users/${user.id}/liked_songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: currentTrack })
      });
      if (res.ok) setIsLiked(true);
    } catch (err) { console.error(err); }
  };

  const percent = duration ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seekTo((x / rect.width) * duration);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.log);
    else document.exitFullscreen();
  };

  if (!currentTrack) return null;

  return (
    <>
      {showLyrics && <LyricsModal track={currentTrack} onClose={() => setShowLyrics(false)} />}

      <div className="player-bar">
        {/* Left: Now Playing */}
        <div className="player-left">
          <img src={currentTrack.albumArt} alt={currentTrack.title} className="now-playing-img" />
          <div className="now-playing-info">
            <span className="now-playing-title">{currentTrack.title}</span>
            <span className="now-playing-artist">{currentTrack.artist}</span>
          </div>
          <button className="like-btn" onClick={handleLike} title={isLiked ? "Saved" : "Save to Liked Songs"}>
            <Heart size={16} fill={isLiked ? "var(--essential-bright)" : "transparent"} color={isLiked ? "var(--essential-bright)" : "currentColor"} />
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="player-center">
          <div className="player-controls">
            <button className="control-btn hover-bright" onClick={toggleShuffle} style={{ color: isShuffle ? 'var(--essential-bright)' : 'var(--text-subdued)' }}>
              <Shuffle size={20} />
            </button>
            <button className="control-btn hover-bright" onClick={prevTrack}><SkipBack size={20} fill="currentColor" /></button>
            <button className="play-pause-btn control-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" style={{ marginLeft: '2px' }} />}
            </button>
            <button className="control-btn hover-bright" onClick={nextTrack}><SkipForward size={20} fill="currentColor" /></button>
            <button className="control-btn hover-bright" onClick={toggleRepeat} style={{ color: isRepeat ? 'var(--essential-bright)' : 'var(--text-subdued)' }}>
              <Repeat size={20} />
            </button>
          </div>

          <div className="playback-bar">
            <span className="playback-time">{formatTime(progress)}</span>
            <div className="progress-container" onClick={handleProgressClick}>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <div className="progress-thumb" style={{ left: `${percent}%` }} />
            </div>
            <span className="playback-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Extra Controls */}
        <div className="player-right">
          <button
            className="control-btn"
            title="View Lyrics"
            onClick={() => setShowLyrics(true)}
            style={{ color: showLyrics ? 'var(--essential-bright)' : 'var(--text-subdued)' }}
          >
            <Mic2 size={16} />
          </button>
          <button className="control-btn" onClick={() => alert("Queue view coming soon!")}><LayoutList size={16} /></button>
          <VolumeSlider volume={volume} setVolume={setVolume} />
          <button className="control-btn" onClick={handleFullscreen}><Maximize2 size={16} /></button>
        </div>
      </div>
    </>
  );
};

export default PlayerBar;
