const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

router.get('/userinfo', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user info:', errorText);
      return res.status(500).json({ error: 'Failed to fetch user info' });
    }

    const data = await response.json();
    const { email, sub, name, picture } = data;

    res.json({ email, id: sub, name, picture });

  } catch (err) {
    console.error('Error fetching user info:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
  const token = req.headers.authorization?.split(' ')[1];
  const { playlistItemId } = req.body;

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

router.get('/search', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { query } = req.query;

  if (!query || !token) {
    return res.status(400).json({ error: 'Missing query or token' });
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=10&q=${encodeURIComponent(query)}`;

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
    res.json({ videos: data.items || [] });
  } catch (err) {
    console.error('YouTube search error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addToPlaylist', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { playlistId, videoId } = req.body;

    if (!token || !playlistId || !videoId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error('YouTube addToPlaylist error:', err.message);
    res.status(500).json({ error: 'Failed to add video to playlist' });
  }
});

module.exports = router;