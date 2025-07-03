const express = require('express');

const router = express.Router();

// Fetch user's Spotify playlists
router.get('/playlists', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching playlists:', errorData);
            return res.status(response.status).json({ error: 'Failed to fetch playlists' });
        }

        const data = await response.json();
        res.json(data.items); // Return playlists
        
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// GET /spotify/playlists/:playlistId/tracks
router.get("/playlists/:playlistId/tracks", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const playlistId = req.params.playlistId;

    try {
        const spotifyRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        if (!spotifyRes.ok) {
        const error = await spotifyRes.text();
        console.error("Spotify API Error:", error);
        return res.status(spotifyRes.status).json({ error: 'Failed to fetch playlist tracks' });
        }

        const data = await spotifyRes.json();

        res.json(data);
    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/deletePlaylist", async (req, res) => {
    const playlistId = req.body.playlistId;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const spotifyRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (spotifyRes.ok) {
            return res.json({ message: 'Playlist unfollowed (deleted from your library).' });
        } else {
            const error = await spotifyRes.json();
            return res.status(spotifyRes.status).json({ error });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/deleteTrack', async (req, res) => {
    const { playlistId, trackId, token } = req.body;

    if (!playlistId || !trackId || !token) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'DELETE',
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            tracks: [{ uri: `spotify:track:${trackId}` }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Spotify delete failed');

        return res.json({ message: 'Track deleted from Spotify playlist' });

    } catch (err) {
        console.error('Delete track error:', err.message);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});

module.exports = router;
