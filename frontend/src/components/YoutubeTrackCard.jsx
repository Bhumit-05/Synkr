import React, { useState } from 'react';
import { refreshYouTubeToken } from '../utils/refresh';
import Toaster from './UI/Toaster';

const YoutubeTrackCard = ({ track, index }) => {
  const [toast, setToast] = useState({ message: '', type: '' });
  const snippet = track.snippet;

  const handleRemove = async () => {
    const token = await refreshYouTubeToken();
    if (!token) {
      setToast({ message: "YouTube token missing ❌", type: "error" });
      return;
    }

    try {
        const res = await fetch("https://synkr-vtpk.onrender.com/youtube/deleteTrack", {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
            playlistItemId: track.id,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to delete track:", data);
            setToast({ message: "Failed to delete track ❌", type: "error" });
            return;
        }

        setToast({ message: "Track deleted ✅", type: "success" });
        setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
        console.error("Server error while deleting track:", err.message);
        setToast({ message: "Server error ❌", type: "error" });
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="relative">
      {/* Toast Notification */}
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
          src={snippet?.thumbnails?.medium?.url}
          alt={snippet?.title}
          className="w-full md:w-60 h-40 object-cover"
        />

        <div className="p-4 flex flex-col justify-between gap-2 flex-grow">
          <div>
            <h2 className="text-lg font-semibold text-white">{snippet.title}</h2>
            <p className="text-sm text-gray-400">
              by {snippet.videoOwnerChannelTitle || snippet.channelTitle}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Published on {formatDate(snippet.publishedAt)}
            </p>
          </div>

          {snippet.resourceId?.videoId ? (
            <a
              href={`https://youtube.com/watch?v=${snippet.resourceId.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-fit inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white transition"
            >
              ▶️ Watch on YouTube
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic mt-2">No link available</p>
          )}
        </div>

        <button
          onClick={handleRemove}
          className="bg-red-500 hover:cursor-pointer hover:bg-red-600 text-white h-fit my-auto mx-4 px-4 py-2 rounded-xl transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default YoutubeTrackCard;
