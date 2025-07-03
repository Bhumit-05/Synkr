const express = require('express');
const router = express.Router();

router.get('/playlists', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('YT playlist fetch error:', errorData);
            return res.status(500).json({ error: 'Failed to fetch YT playlists' });
        }

        const data = await response.json();
        res.json(data.items);

    }
    catch (err) {
        console.error('YT playlist fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch YT playlists' });
    }
});

router.get("/playlists/:playlistId/tracks", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const playlistId = req.params.playlistId;
    const baseUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';

    try {
        let allItems = [];
        let nextPageToken = '';
        
        do {
            const url = `${baseUrl}?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}`;
            const ytRes = await fetch(url, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!ytRes.ok) {
                const error = await ytRes.text();
                console.error("YouTube API Error:", error);
                return res.status(ytRes.status).json({ error: 'Failed to fetch playlist items' });
            }

            const data = await ytRes.json();
            allItems.push(...data.items);
            nextPageToken = data.nextPageToken || '';
        } while (nextPageToken);

        res.json(allItems);
    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/deletePlaylist', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const playlistId = req.body.playlistId;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!ytRes.ok) {
      const errorText = await ytRes.text();
      console.error('YouTube API Error:', errorText);
      return res.status(ytRes.status).json({ error: 'Failed to delete YouTube playlist' });
    }

    res.status(200).json({ message: 'Playlist deleted successfully ✅' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/deleteTrack', async (req, res) => {
  const { playlistItemId, token } = req.body;

  if (!playlistItemId || !token) {
    return res.status(400).json({ error: 'Missing playlistItemId or token' });
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('YouTube delete error:', err);
      return res.status(500).json({ error: 'Failed to delete video from playlist' });
    }

    res.json({ message: 'Video removed from YouTube playlist ✅' });
  } catch (error) {
    console.error('Server error during YouTube track deletion:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;