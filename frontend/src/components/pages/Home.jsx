import { SPOTIFY_LOGO, YOUTUBE_LOGO } from '../../constants';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [youtubeLoggedIn, setYouTubeLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSpotifyLoggedIn(!!localStorage.getItem('spotifyAccessToken'));
    setYouTubeLoggedIn(!!localStorage.getItem('youtubeAccessToken'));
  }, []);

  const handleLogout = (platform) => {
    localStorage.removeItem(`${platform}AccessToken`);
    localStorage.removeItem(`${platform}RefreshToken`);
    if (platform === 'spotify') setSpotifyLoggedIn(false);
    if (platform === 'youtube') setYouTubeLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-extralight mb-4 tracking-wide">
        Welcome to <span className="text-blue-400">Synkr</span> 🎵
      </h1>
      <p className="text-lg mb-12 text-gray-400 text-center max-w-xl">
        Seamlessly sync your playlists between <span className="text-green-400">Spotify</span> and <span className="text-red-400">YouTube</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Spotify Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center w-[260px] hover:shadow-2xl transition-all">
          <img src={SPOTIFY_LOGO} alt="Spotify" className="w-32 mb-6" />
          {spotifyLoggedIn ? (
            <>
              <p className="text-sm text-green-300 mb-3">Logged in to Spotify</p>
              <button
                onClick={() => handleLogout('spotify')}
                className="w-full px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <a
              href="http://localhost:4000/spotifyAuth/login"
              className="px-6 py-2 w-full text-center bg-green-500/90 hover:bg-green-600 text-white font-medium rounded-xl transition cursor-pointer"
            >
              Login with Spotify
            </a>
          )}

        </div>

        {/* YouTube Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center w-[260px] hover:shadow-2xl transition-all">
          <img src={YOUTUBE_LOGO} alt="YouTube" className="w-32 mb-6" />
          {youtubeLoggedIn ? (
            <>
              <p className="text-sm text-red-300 mb-3">Logged in to YouTube</p>
              <button
                onClick={() => handleLogout('youtube')}
                className="px-6 py-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition"
              >
                Log out
              </button>
            </>
          ) : (
            <a
              href="http://localhost:4000/youtubeAuth/login"
              className="px-6 py-2 w-full text-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition"
            >
              Login with YouTube
            </a>
          )}
        </div>
      </div>

      {/* Show Dashboard button if logged in to both */}
      {spotifyLoggedIn && youtubeLoggedIn && (
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-12 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
};

export default HomePage;
