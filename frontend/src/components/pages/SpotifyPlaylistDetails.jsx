import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from '../UI/DeletePlaylistModal';
import SpotifyTrackCard from '../SpotifyTrackCard'
import { refreshSpotifyToken } from '../../utils/refresh';

const SpotifyPlaylistDetails = () => {
    const { id, PlaylistTitle } = useParams();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const changeModalState = (state) => {
      setShowModal(state);
    }

    const fetchTracks = async () => {
      try {
        const token = await refreshSpotifyToken();
        if (!token) return;

        const res = await fetch(
        `http://localhost:4000/spotify/playlists/${id}/tracks`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        const data = await res.json();
        
        setTracks(data.items);
      } catch (err) {
          console.error('Track fetch error:', err);
          setTracks([]);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => {
        fetchTracks();
    }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-black text-white px-6 py-20">
        <div className="mt-20 mb-10 px-4 lg:px-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-y-6">
                {/* Playlist Title */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <h1 className="text-2xl sm:text-3xl font-light text-white whitespace-nowrap">
                        🎵 Spotify Playlist:
                    </h1>
                    <h2 className="text-2xl sm:text-4xl font-semibold text-green-400 break-words">
                        {PlaylistTitle}
                    </h2>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white px-4 py-2 rounded-xl text-base sm:text-lg transition duration-200">
                    Delete Playlist
                </button>
            </div>
        </div>

        {tracks.length > 0 && (
          <div className='flex flex-row gap-1 mb-16 mt-5 text-xl ml-20'> 
            <div className='text-green-500'>{tracks.length}</div>
            <div>Songs in this playlist</div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <p className="text-gray-400">No tracks found.</p>
        ) : (
          <div className="space-y-6">
            {tracks.map((item, index) => {
              const track = item.track;
              if (!track) return null;
              return (
                <SpotifyTrackCard key = {index} track={track} index={index} playlistId={id}/>
              );
            })}
          </div>
        )}

        {showModal && (<Modal onAction={changeModalState} platform="spotify" id={id}/>)}
    </div>
  );
};

export default SpotifyPlaylistDetails;