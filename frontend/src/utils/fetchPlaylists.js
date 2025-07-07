export const fetchYoutubePlaylists = async (youtubeToken) => {
  try {
    const res = await fetch('http://localhost:4000/youtube/playlists', {
      headers: {
        Authorization: `Bearer ${youtubeToken}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch YouTube playlists');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('YouTube fetch error:', err);
    return null;
  }
};

export const fetchSpotifyPlaylist = async (spotifyToken) => {
  try {
    const res = await fetch('http://localhost:4000/spotify/playlists', {
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
