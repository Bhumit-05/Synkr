const express = require('express');
const router = express.Router();

// Sync YouTube → Spotify
router.post('/youtube-to-spotify', async (req, res) => {
    const { youtubeToken, spotifyToken, playlistId, playlistTitle } = req.body;

    if (!youtubeToken || !spotifyToken || !playlistId) {
        return res.status(400).json({ error: 'Missing token or playlist ID' });
    }

    try {
        // Fetching YouTube playlist items
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}`, {
            headers: { Authorization: `Bearer ${youtubeToken}` }
        });

        if (!ytRes.ok) {
            const errData = await ytRes.json();
            throw new Error(`YouTube fetch error: ${JSON.stringify(errData)}`);
        }

        const ytData = await ytRes.json();
        const videoTitles = ytData.items.map(item => item.snippet.title);

        // Searching for each video title on Spotify
        const matchedTrackUris = [];

        for (const title of videoTitles) {
            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=track&limit=5`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });

            const data = await searchRes.json();
            const track = data.tracks?.items?.[0];
            console.dir(data, {depth: null})

            if (track) {
                matchedTrackUris.push(track.uri);
            } else {
                console.warn(`No match found on Spotify for: ${title}`);
            }
        }

        // 3. Creating a new Spotify playlist
        const profileRes = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        const user = await profileRes.json();

        const playlistRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${playlistTitle} - Synkr`,
                description: 'Synced from YouTube via Synkr',
                public: false
            })
        });

        const playlistData = await playlistRes.json();
        const newSpotifyPlaylistId = playlistData.id;

        // 4. Adding tracks
        if (matchedTrackUris.length > 0) {
            await fetch(`https://api.spotify.com/v1/playlists/${newSpotifyPlaylistId}/tracks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: matchedTrackUris
                })
            });
        }

        res.json({ success: true, newSpotifyPlaylistId, addedTracks: matchedTrackUris.length });

    } catch (err) {
        console.error('Sync error:', err.message);
        res.status(500).json({ error: 'Failed to sync YouTube to Spotify' });
    }
});


module.exports = router;