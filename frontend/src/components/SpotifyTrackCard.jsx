import React, { useState } from 'react';
import { refreshSpotifyToken } from '../utils/refresh';
import Toaster from './UI/Toaster';

const SpotifyTrackCard = ({ track, index, playlistId }) => {
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleRemove = async () => {
    try {
      const token = await refreshSpotifyToken();
      const res = await fetch("https://synkr-vtpk.onrender.com/spotify/deleteTrack", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          trackId: track.id,
          playlistId: playlistId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to delete track:', data.error);
        setToast({ message: "Track deletion failed ❌", type: "error" });
        return;
      }

      setToast({ message: "Track deleted ✅", type: "success" });
      setTimeout(() => window.location.reload(), 1000); // wait for toast to show
    } catch (err) {
      console.error("Error deleting track:", err.message);
      setToast({ message: "Something went wrong ❌", type: "error" });
    }
  };

  return (
    <div className="relative">
      {toast.message && (
        <Toaster
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      <div className="flex flex-col md:flex-row items-start bg-slate-800/60 rounded-xl overflow-hidden shadow-md border border-slate-700 transition hover:shadow-xl">
        <div className="text-xl font-mono px-4 py-2 text-gray-300 min-w-[50px] text-center">
          {index + 1}
        </div>

        <img
          src={track.album?.images?.[1]?.url} alt={track.name} className="w-full md:w-60 h-40 object-cover"/>

        <div className="p-4 flex flex-col justify-between gap-2 flex-grow">
            <div>
                <h2 className="text-lg font-semibold text-white">{track.name}</h2>
                <p className="text-sm text-gray-400">
                by {track.artists.map((a) => a.name).join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                Album: {track.album?.name}
                </p>
            </div>

            {track?.external_urls?.spotify ? (
                <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-fit inline-block px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition"
                >
                🎧 Listen on Spotify
                </a>
            ) : (
                <p className="text-sm text-gray-400 italic mt-2">No link available</p>
            )}
        </div>

        <button
            onClick={handleRemove}
            className="bg-red-500 hover:bg-red-600 text-white h-fit my-auto mx-4 px-4 py-2 rounded-xl transition">
            Remove
        </button>
      </div>
    </div>
  );
};

export default SpotifyTrackCard;
