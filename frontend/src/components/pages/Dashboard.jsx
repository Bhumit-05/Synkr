import React, { useEffect, useState } from 'react';
import PlaylistCard from '../PlaylistCard';
import Spinner from '../UI/Spinner';
import Toaster from '../UI/Toaster';
import { refreshSpotifyToken, refreshYouTubeToken } from '../../utils/refresh';
import { fetchSpotifyPlaylist, fetchYoutubePlaylists } from '../../utils/fetchPlaylists';

const Dashboard = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [selectedSpotify, setSelectedSpotify] = useState(null);
  const [selectedYouTube, setSelectedYouTube] = useState(null);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState(null);
  const [selectedYouTubePlaylist, setSelectedYouTubePlaylist] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchPlaylists = async () => {
    const spotifyToken = await refreshSpotifyToken();
    const youtubeToken = await refreshYouTubeToken();

    if (spotifyToken) {
      const playlists = await fetchSpotifyPlaylist(spotifyToken);
      setSpotifyPlaylists(playlists);
    }

    if (youtubeToken) {
      const playlists = await fetchYoutubePlaylists(youtubeToken);
      setYoutubePlaylists(playlists);
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
        await fetch('https://synkr-vtpk.onrender.com/sync/spotify-to-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotifyToken,
            youtubeToken,
            playlistId: selectedSpotify,
            playlistTitle: selectedSpotifyPlaylist,
          }),
        });
        setToast({ message: 'Spotify → YouTube Sync Complete ✅', type: 'success' });
      } else if (direction === 'youtube-to-spotify') {
        await fetch('https://synkr-vtpk.onrender.com/sync/youtube-to-spotify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtubeToken,
            spotifyToken,
            playlistId: selectedYouTube,
            playlistTitle: selectedYouTubePlaylist,
          }),
        });
        setToast({ message: 'YouTube → Spotify Sync Complete ✅', type: 'success' });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Sync failed ❌', type: 'error' });
    } finally {
      setSyncing(false);
      setSelectedSpotify(null);
      setSelectedSpotifyPlaylist(null);
      setSelectedYouTube(null);
      setSelectedYouTubePlaylist(null);
      fetchPlaylists();
    }
  };

  if (syncing) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-black text-white p-8 font-light relative">
      {toast.message && (
        <Toaster
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      <h2 className="text-4xl font-extralight mb-12 mt-[15%] md:mt-[10%] text-center tracking-wide">
        Your Syncing Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Spotify Playlists */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl h-fit">
          <h3 className="text-2xl font-light mb-4 text-green-400">Spotify Playlists</h3>
          <ul className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 min-h-[28rem]">
            {spotifyPlaylists.map((p) => (
              <li key={p.id}>
                <PlaylistCard
                  id={p.id}
                  platform="spotify"
                  playlist={p}
                  onSelect={() => {
                    setSelectedSpotify((prev) => (prev === p.id ? null : p.id));
                    setSelectedSpotifyPlaylist((prev) => (prev === p.name ? null : p.name));
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
            disabled={!selectedSpotify}>
            Sync to YouTube ⏩
          </button>
        </div>

        {/* YouTube Playlists */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 transition hover:shadow-2xl">
          <h3 className="text-2xl font-light mb-4 text-red-400">YouTube Music Playlists</h3>
          <ul className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700 min-h-[28rem]">
            {youtubePlaylists.map((p) => (
              <li key={p.id}>
                <PlaylistCard
                  id={p.id}
                  platform="youtube"
                  playlist={p}
                  onSelect={() => {
                    setSelectedYouTube((prev) => (prev === p.id ? null : p.id));
                    setSelectedYouTubePlaylist((prev) =>
                      prev === p.snippet.title ? null : p.snippet.title
                    );
                  }}
                  selected={p.id === selectedYouTube}
                  accentColor="ring-red-500"/>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSync('youtube-to-spotify')}
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!selectedYouTube}>
            Sync to Spotify ⏪
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
