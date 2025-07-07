import React from 'react';

const PlaylistModal = ({ playlists, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center px-4">
      <div className="bg-slate-900 p-6 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-light text-white">🎶 Select a Playlist</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {playlists.map((p) => {
            const isYouTube = !!p.snippet;

            const image = isYouTube
              ? p.snippet.thumbnails?.default?.url
              : p.images?.[0]?.url;

            const title = isYouTube ? p.snippet.title : p.name;

            const owner = isYouTube
              ? p.snippet.channelTitle
              : p.owner?.display_name || 'Unknown Owner';

            return (
              <li
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl cursor-pointer transition"
              >
                <img
                  src={image || 'https://via.placeholder.com/60x60.png?text=Playlist'}
                  alt={title}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-600"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium line-clamp-1">{title}</h4>
                  <p className="text-xs text-gray-400">{owner}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
