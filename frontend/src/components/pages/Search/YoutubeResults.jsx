import React, { useState } from 'react';
import PlaylistModal from '../../UI/PlaylistModal';
import { refreshYouTubeToken } from '../../../utils/refresh';
import { fetchYoutubePlaylists } from '../../../utils/fetchPlaylists';
import Toaster from '../../UI/Toaster';

const YouTubeResults = ({ tracks }) => {
  const videos = tracks?.videos || [];
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleAddClick = async (video) => {
    setSelectedVideo(video);
    const token = await refreshYouTubeToken();
    const data = await fetchYoutubePlaylists(token);
    if (data) {
      setPlaylists(data);
      setShowModal(true);
    }
  };

  const handleSelectPlaylist = async (playlistId) => {
    const token = await refreshYouTubeToken();
    try {
      await fetch('https://synkr-vtpk.onrender.com/youtube/addToPlaylist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          playlistId,
          videoId: selectedVideo.id?.videoId || selectedVideo.id,
        }),
      });
      setToast({ message: 'Video added ✅', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to add video ❌', type: 'error' });
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full items-center lg:ml-40">
    {toast.message && (
      <Toaster
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    )}
      <h2 className="text-3xl font-light text-white text-center">📺 YouTube Music Results
      </h2>

      {videos.length === 0 ? (
        <p className="text-gray-500 text-center">No YouTube videos found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full px-4">
          {videos.map((item) => {
            const snippet = item.snippet || {};
            const videoId = item.id?.videoId || item.id;

            return (
              <div
                key={videoId}
                className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col">
                <img src={snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url} alt={snippet.title} className="w-full h-80"/>

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {snippet.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    by {snippet.videoOwnerChannelTitle || snippet.channelTitle}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`https://youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 w-[48%] bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">
                      ▶️ YouTube
                    </a>
                    <button
                      onClick={() => handleAddClick(item)}
                      className="px-3 py-2 w-[48%] bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                      + Add to playlist
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

export default YouTubeResults;