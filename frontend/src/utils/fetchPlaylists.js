export const fetchYoutubePlaylists = async (youtubeToken) => {
  try {
    const res = await fetch('https://synkr-vtpk.onrender.com/youtube/playlists', {
      headers: {
        Authorization: `Bearer ${youtubeToken}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch YouTube playlists');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('YouTube fetch error:', err);
    return [];
  }
};

export const fetchSpotifyPlaylist = async (spotifyToken) => {
  try {
    const res = await fetch('https://synkr-vtpk.onrender.com/spotify/playlists', {
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch Spotify playlists');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Spotify fetch error:', err);
    return null;
  }
};
