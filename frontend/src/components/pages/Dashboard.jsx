import React, { useEffect, useState } from 'react';
import PlaylistCard from '../PlaylistCard';
import Spinner from '../Spinner';
import { refreshSpotifyToken, refreshYouTubeToken } from '../../utils/api';

const Dashboard = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [selectedSpotify, setSelectedSpotify] = useState(null);
  const [selectedYouTube, setSelectedYouTube] = useState(null);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState(null);
  const [selectedYouTubePlaylist, setSelectedYouTubePlaylist] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchPlaylists = async () => {
    const spotifyToken = await refreshSpotifyToken();
    const youtubeToken = await refreshYouTubeToken();

    // Fetch Spotify playlists if token is present
    if (spotifyToken) {
      fetch('http://localhost:4000/spotify/playlists', {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch Spotify playlists');
          return res.json();
        })
        .then((data) => setSpotifyPlaylists(data))
        .catch((err) => console.error('Spotify fetch error:', err));
    }

    // Fetch YouTube playlists if token is present
    if (youtubeToken) {
      fetch('http://localhost:4000/youtube/playlists', {
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch YouTube playlists');
          return res.json();
        })
        .then((data) => setYoutubePlaylists(data))
        .catch((err) => console.error('YouTube fetch error:', err));
    }
  }

  useEffect(() => {
    fetchPlaylists();
  }, []);


  const handleSync = async (direction) => {
    const spotifyToken = await refreshSpotifyToken();
    const youtubeToken = await refreshYouTubeToken();

    setSyncing(true);
    try {
      if (direction === 'spotify-to-youtube') {
        await fetch('http://localhost:4000/sync/spotify-to-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotifyToken: spotifyToken,
            youtubeToken: youtubeToken,
            playlistId: selectedSpotify,
            playlistTitle : selectedSpotifyPlaylist
          })
        });
        alert('Spotify → YouTube Sync Complete ✅');
      } 
      else if (direction === 'youtube-to-spotify') {
        await fetch('http://localhost:4000/sync/youtube-to-spotify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtubeToken: youtubeToken,
            spotifyToken: spotifyToken,
            playlistId: selectedYouTube,
            playlistTitle: selectedYouTubePlaylist
          })
        });
        alert('YouTube → Spotify Sync Complete ✅');
      }
    } catch (error) {
      console.error(error);
      alert('Sync failed ❌');
    }
    finally{
      setSyncing(false);
      setSelectedSpotify(null);
      setSelectedSpotifyPlaylist(null);
      setSelectedYouTube(null);
      setSelectedYouTubePlaylist(null);
      fetchPlaylists();
    }
  };

  if (syncing) {
    return (
      <Spinner/>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-zinc-900 text-white p-8 font-light">
      <h2 className="text-4xl font-extralight mb-12 mt-32 text-center tracking-wide">
        🎵 Your Synced Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Spotify Playlists */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl">
          <h3 className="text-2xl font-light mb-4 text-green-400">Spotify Playlists</h3>
          <ul className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl min-h-[28rem]">
            {spotifyPlaylists.map(p => (
              <li key={p.id}>
                <PlaylistCard
                  id={p.id}
                  platform="spotify"
                  playlist={p}
                  onSelect={() => {
                    setSelectedSpotify(prev => (prev === p.id ? null : p.id))
                    setSelectedSpotifyPlaylist(prev => (prev === p.name ? null : p.name))
                  }}
                  selected={p.id === selectedSpotify}
                  accentColor="ring-green-500"
                />
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSync('spotify-to-youtube')}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!selectedSpotify}
          >
            Sync to YouTube ⏩
          </button>
        </div>

        {/* YouTube Playlists */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl">
          <h3 className="text-2xl font-light mb-4 text-red-400">YouTube Playlists</h3>
          <ul className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl min-h-[28rem]">
            {youtubePlaylists.map(p => (
              <li key={p.id}>
                <PlaylistCard
                  id={p.id}
                  platform="youtube"
                  playlist = {p}
                  onSelect={() => {
                    setSelectedYouTube(prev => (prev === p.id ? null : p.id));
                    setSelectedYouTubePlaylist(prev => (prev === p.snippet.title ? null : p.snippet.title));
                  }}
                  selected={p.id === selectedYouTube}
                  accentColor="ring-red-500"
                />
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSync('youtube-to-spotify')}
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!selectedYouTube}
          >
            Sync to Spotify ⏪
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
