import React, { useState } from 'react';
import PlaylistModal from '../../UI/PlaylistModal';
import Toaster from '../../UI/Toaster';
import { fetchSpotifyPlaylist } from '../../../utils/fetchPlaylists';
import { refreshSpotifyToken } from '../../../utils/refresh';

const SpotifyResults = ({ tracks }) => {
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleAddClick = async (track) => {
    setSelectedTrack(track);
    const token = await refreshSpotifyToken();
    const data = await fetchSpotifyPlaylist(token);
    if (data) {
      setPlaylists(data);
      setShowModal(true);
    }
  };

  const handleSelectPlaylist = async (playlistId) => {
    const token = await refreshSpotifyToken();
    try {
      await fetch('http://localhost:4000/spotify/addToPlaylist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          playlistId,
          trackUri: selectedTrack.uri,
        }),
      });
      setToast({ message: 'Track added ✅', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to add track ❌', type: 'error' });
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full items-center relative">
      {toast.message && (
        <Toaster
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}/>
      )}

      <h2 className="text-3xl font-light text-white text-center">🎵 Spotify Results</h2>

      {tracks.length === 0 ? (
        <p className="text-gray-500 text-center">No Spotify tracks found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full px-4">
          {tracks.map((track) => (
            <div key={track.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col">
              <img src={track.album?.images?.[0]?.url} alt={track.name} className="w-full h-80" />
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2">{track.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-1">by {track.artists.map((a) => a.name).join(', ')}</p>
                <p className="text-xs text-gray-500">Album: {track.album?.name}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {track?.external_urls?.spotify && (
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 w-[48%] bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition">
                      🎧 Listen
                    </a>
                  )}
                  <button
                    onClick={() => handleAddClick(track)}
                    className="px-3 py-2 w-[48%] bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                    + Playlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PlaylistModal
          playlists={playlists}
          onSelect={handleSelectPlaylist}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SpotifyResults;
