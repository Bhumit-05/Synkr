import { useNavigate } from 'react-router-dom';

const PlaylistCard = ({ playlist, selected, accentColor, platform, id, onSelect }) => {
  const navigate = useNavigate();

  let title = playlist.snippet?.title;
  let subtitle = `${playlist.snippet?.channelTitle || 'YouTube'} • Playlist`;
  let thumbnail =  playlist.snippet?.thumbnails?.medium?.url;

  if(platform==="spotify"){
    title = playlist.name;
    subtitle = `${playlist.owner.display_name} • Playlist`;
    thumbnail = playlist.images?.[0]?.url
  }

  const handleView = (e) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    navigate(`/playlist/${platform}/${id}/${title}`);
  };

  return (
    <div
      onClick={onSelect} // Only select on card click
      className={`mt-2 flex items-center gap-4 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition cursor-pointer ${
        selected ? `${accentColor} ring-2` : ''
      }`}
    >
      <img src={thumbnail} alt={title} className="w-16 h-16 rounded object-cover" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      <button
        onClick={handleView}
        className="text-blue-400 hover:text-blue-300 transition duration-300 bg-slate-700/80 px-2 py-1 rounded-xl hover:cursor-pointer"
        title="View Playlist"
      >
        View
      </button>
    </div>
  );
};

export default PlaylistCard;
