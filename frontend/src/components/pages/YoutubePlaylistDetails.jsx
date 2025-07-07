import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from '../UI/DeletePlaylistModal';
import YoutubeTrackCard from '../YoutubeTrackCard';
import { refreshYouTubeToken } from '../../utils/refresh';

const YoutubePlaylistDetails = () => {
  const { id, PlaylistTitle } = useParams();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const changeModalState = (state) => {
    setShowModal(state);
  }

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const token = await refreshYouTubeToken();
        if (!token) return;

        const res = await fetch(`http://localhost:4000/youtube/playlists/${id}/tracks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data.items)) {
          setTracks(data.items);
        } else if (Array.isArray(data)) {
          setTracks(data);
        } else {
          console.warn('Unexpected data format:', data);
          setTracks([]);
        }
      } catch (err) {
        console.error('Track fetch error:', err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-black text-white px-6 py-20">
      <div className="lg:flex mt-20 lg:justify-between mx-4 sm:mx-10 lg:mx-20 gap-y-4 flex-wrap">
        <div className="flex gap-x-4 flex-wrap items-center">
          <h1 className="text-2xl sm:text-3xl font-light whitespace-nowrap">📺 YouTube Music Playlist:</h1>
          <h1 className="text-3xl sm:text-4xl font-semibold break-words">{PlaylistTitle}</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white px-4 py-2 rounded-xl text-base sm:text-lg transition duration-200">
          Delete Playlist
        </button>
      </div>

      {tracks.length > 0 && (
        <div className='flex flex-row gap-1 mb-16 mt-5 text-xl ml-20'> 
          <div className='text-red-500'>{tracks.length}</div>
          <div>Songs in this playlist</div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading tracks...</p>
      ) : tracks.length === 0 ? (
        <p className="text-gray-400">No tracks found.</p>
      ) : (
        <div className="space-y-6">
          {tracks.map((track, index) => 
            <YoutubeTrackCard key={track.id || index} track={track} index={index} platform={"youtube"}/>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (<Modal onAction={changeModalState} platform="youtube" id={id}/>)}
    </div>
  );
};

export default YoutubePlaylistDetails;
