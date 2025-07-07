export const refreshSpotifyToken = async () => {
  const refreshToken = localStorage.getItem('spotifyRefreshToken');
  if (!refreshToken) return null;

  const res = await fetch("https://synkr-vtpk.onrender.com/spotifyAuth/refresh", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('spotifyAccessToken', data.access_token);
    return data.access_token;
  } else {
    console.warn('Spotify token refresh failed');
    return null;
  }
};

export const refreshYouTubeToken = async () => {
  const refreshToken = localStorage.getItem('youtubeRefreshToken');
  if (!refreshToken) return null;

  const res = await fetch("https://synkr-vtpk.onrender.com/youtubeAuth/refresh", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('youtubeAccessToken', data.access_token);
    return data.access_token;
  } else {
    console.warn('YouTube token refresh failed');
    return null;
  }
};
