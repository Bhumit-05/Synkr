import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');

    if (access_token && refresh_token) {
      localStorage.setItem('spotifyAccessToken', access_token);
      localStorage.setItem('spotifyRefreshToken', refresh_token);
      navigate('/dashboard');
    } else {
      console.error('Missing Spotify tokens in callback URL');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return <div className="text-center p-8 text-white">Processing Spotify login...</div>;
};

export default SpotifyCallback;
