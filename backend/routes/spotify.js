const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return res.status(500).json({ error: 'Failed to fetch Spotify user info' });

        const data = await response.json();
        res.json({ email: data.email, id: data.id });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

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
            const text = await response.text();
            console.log(text);
            const errorData = await response.json();
            console.error('Error fetching playlists:', errorData);
            return res.status(response.status).json({ error: 'Failed to fetch playlists' });
        }

        const data = await response.json();
        res.json(data.items);
        
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

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
            return res.json({ message: 'Playlist deleted from your library' });
        } else {
            const error = await spotifyRes.json();
            return res.status(spotifyRes.status).json({ error });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/deleteTrack', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { playlistId, trackId } = req.body;

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

router.get('/search', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { query } = req.query;

    if (!query || !token) {
        return res.status(400).json({ error: 'Missing query or token' });
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

    try {
        const response = await fetch(searchUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(500).json({ error });
        }

        const data = await response.json();
        res.json({ tracks: data.tracks?.items || [] });
    } catch (err) {
        console.error('Spotify search error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/addToPlaylist', async (req, res) => {
  try {
    const { playlistId, trackUri } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || !playlistId || !trackUri) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: [trackUri],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Spotify addToPlaylist error:', error);
        return res.status(500).json({ error: 'Failed to add track to playlist' });
    }

    const data = await response.json();
    res.status(200).json({ success: true, data });
    
    } catch (err) {
        console.error('Spotify addToPlaylist error:', err.message);
        res.status(500).json({ error: 'Failed to add track to playlist' });
    }
});

module.exports = router;
