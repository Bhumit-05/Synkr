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

  } catch (err) {
    console.error('YT playlist fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch YT playlists' });
  }
});

module.exports = router;