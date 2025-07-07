import { SPOTIFY_LOGO, YOUTUBE_LOGO } from '../../constants';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshSpotifyToken, refreshYouTubeToken } from '../../utils/refresh'

const Home = () => {
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [youtubeLoggedIn, setYouTubeLoggedIn] = useState(false);
  const [spotifyEmail, setSpotifyEmail] = useState('');
  const [youtubeEmail, setYouTubeEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const spotifyToken = await refreshSpotifyToken();
      const youtubeToken = await refreshYouTubeToken();

      setSpotifyLoggedIn(!!spotifyToken);
      setYouTubeLoggedIn(!!youtubeToken);

      if (spotifyToken) {
        try {
          const res = await fetch('http://localhost:4000/spotify/me', {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          });
          const data = await res.json();
          setSpotifyEmail(data.email || '');
        } catch (err) {
          console.error('Spotify user fetch failed:', err);
        }
      }

      if (youtubeToken) {
        try {
          const res = await fetch('http://localhost:4000/youtube/userinfo', {
            headers: {
              Authorization: `Bearer ${youtubeToken}`,
            },
          });
          const data = await res.json();
          setYouTubeEmail(data.email || '');
        } catch (err) {
          console.error('YouTube user fetch failed:', err);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = (platform) => {
    localStorage.removeItem(`${platform}AccessToken`);
    localStorage.removeItem(`${platform}RefreshToken`);
    if (platform === 'spotify') {
      setSpotifyLoggedIn(false);
      setSpotifyEmail('');
    }
    if (platform === 'youtube') {
      setYouTubeLoggedIn(false);
      setYouTubeEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-extralight mt-[25%] sm:mt-[10%] mb-4 tracking-wide">
        Welcome to <span className="text-blue-400">Synkr</span> 🎵
      </h1>
      <p className="text-lg mb-12 text-gray-400 text-center max-w-xl">
        Seamlessly sync your playlists between <span className="text-green-400">Spotify</span> and <span className="text-red-400">YouTube Music</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Spotify Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center w-[260px] hover:shadow-2xl transition-all">
          <img src={SPOTIFY_LOGO} alt="Spotify" className="w-32 mb-6" />
          {spotifyLoggedIn ? (
            <>
              <p className="text-sm text-green-300 mb-1">Logged in to Spotify as</p>
              <p className="text-xs text-gray-400 mb-3">{spotifyEmail}</p>
              <button
                onClick={() => handleLogout('spotify')}
                className="w-full px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition cursor-pointer">
                Log out
              </button>
            </>
          ) : (
            <a
              href="http://localhost:4000/spotifyAuth/login?show_dialog=true"
              className="px-6 py-2 w-full text-center bg-green-500/90 hover:bg-green-600 text-white font-medium rounded-xl transition cursor-pointer">
              Login with Spotify
            </a>
          )}
        </div>

        {/* YouTube Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center w-[260px] hover:shadow-2xl transition-all">
          <div className="flex flex-row">
            <img src={YOUTUBE_LOGO} alt="YouTube" className="w-10 mb-6" />
            <p className="mt-1 ml-2 text-xl font-semibold">YouTube Music</p>
          </div>
          {youtubeLoggedIn ? (
            <div>
              <p className="text-sm text-red-300 mb-1">Logged in to YouTube Music as</p>
              <p className="text-xs text-gray-400 mb-3">{youtubeEmail}</p>
              <button
                onClick={() => handleLogout('youtube')}
                className="px-6 py-2 w-full bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white font-medium rounded-xl transition">
                Log out
              </button>
            </div>
          ) : (
            <a
              href="http://localhost:4000/youtubeAuth/login"
              className="px-6 py-2 w-full text-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition">
              Login with YouTube
            </a>
          )}
        </div>
      </div>

      {spotifyLoggedIn && youtubeLoggedIn && (
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-12 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition cursor-pointer"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
};

export default Home;
