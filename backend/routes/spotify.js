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

module.exports = router;
