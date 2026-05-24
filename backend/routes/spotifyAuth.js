const express = require('express');
const querystring = require('querystring');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Redirecting to Spotify login
router.get('/login', (req, res) => {
    // scope -> which user's data will be accessible by my backend
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
            show_dialog: 'true',
            redirect_uri: REDIRECT_URI,
        });

    res.redirect(authUrl);
});

// Handling callback and exchange code for tokens
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

        const redirectUrl = `https://synkr-vtpk.onrender.com/spotify/callback?access_token=${access_token || 'none'}&refresh_token=${refresh_token || 'none'}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Callback error:', error);
        res.status(500).send('Something went wrong during the Spotify auth flow');
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    console.log({
        CLIENT_ID: CLIENT_ID?.slice(0, 8),
        CLIENT_SECRET_EXISTS: !!CLIENT_SECRET,
        CLIENT_SECRET_LENGTH: CLIENT_SECRET?.length,
    });

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded',
                    Authorization: `Basic ${credentials}`,
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Spotify token refresh failed:', data);

            return res.status(response.status).json({
                error: 'Failed to refresh token',
                spotifyError: data,
            });
        }

        const { access_token } = data;

        res.send({ access_token });
    } 
    catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;