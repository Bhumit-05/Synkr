const express = require('express');
const querystring = require('querystring');
const dotenv = require('dotenv');
const { spotifyUser } = require('../models/User');

dotenv.config();

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Redirect to Spotify login
router.get('/login', (req, res) => {
    // scope -> which user's data will be accessible by backend
    const scope = [
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-private',
        'playlist-modify-public',
        'user-library-modify',
        'user-library-read',
        'user-read-email' 
    ].join(' ');

        const authUrl = 'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
        });

    res.redirect(authUrl);
});



// Step 2: Handle callback and exchange code for tokens
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error from Spotify:', errorData);
      return res.status(500).send('Token exchange failed');
    }

    const data = await tokenResponse.json();
    const { access_token, refresh_token } = data;

    // Fetch user profile using access_token
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('Error fetching user profile:', errorData);
      return res.status(500).send('Failed to fetch user profile');
    }

    const userInfo = await userResponse.json();
    const { id, email } = userInfo;

    // Upsert
    await spotifyUser.findOneAndUpdate(
      { spotifyId: id },
      {
        spotifyId: id,
        email : email,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      { upsert: true, new: true }
    );

    // ✅ Final response to client
    res.send({ access_token, refresh_token, user: { id, email } });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Something went wrong during the Spotify auth flow');
  }
});



// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify token refresh failed:', errorData);
      return res.status(500).json({ error: 'Failed to refresh token' });
    }

    const data = await response.json();
    const { access_token } = data;

    // ✅ Update access_token in MongoDB
    const user = await spotifyUser.findOneAndUpdate(
      { refreshToken: refreshToken },
      { accessToken: access_token },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.send({ access_token });
  } catch (error) {
    console.error('Error during token refresh:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
