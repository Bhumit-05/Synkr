// Normalize Spotify playlist data
function normalizeSpotifyPlaylists(spotifyPlaylists) {
  return spotifyPlaylists.map(p => ({
    id: p.id,
    title: p.name,
    platform: 'spotify',
    totalTracks: p.tracks.total,
  }));
}

// Normalize YouTube playlist data
function normalizeYouTubePlaylists(youtubePlaylists) {
  return youtubePlaylists.map(p => ({
    id: p.id,
    title: p.snippet.title,
    platform: 'youtube',
    totalTracks: 0, // optional: fetch separately
  }));
}

module.exports = {
  normalizeSpotifyPlaylists,
  normalizeYouTubePlaylists,
};
