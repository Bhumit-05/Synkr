const express = require('express');
const querystring = require('querystring');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const YT_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'openid',
  'email',
  'profile',
];


// Redirecting to YouTube login
router.get('/login', (req, res) => {
    const qs = querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: YT_SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${qs}`);
});

// Handling callback and exchange code for tokens
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: querystring.stringify({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenRes.json();

        const access_token = tokenData.access_token;
        const refresh_token = tokenData.refresh_token;

        if (!access_token) {
            console.error('Access token missing from response');
            return res.status(400).send('Access token missing');
        }

        const redirectUrl = `https://synkr-xi.vercel.app/:5173/youtube/callback?access_token=${access_token || 'none'}&refresh_token=${refresh_token || 'none'}`;
        res.redirect(redirectUrl)

    } catch (err) {
        console.error('YouTube OAuth error:', err.message);
        res.status(500).send('YouTube OAuth failed');
    }
});


// Refreshing access token using refresh token
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: querystring.stringify({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Token refresh failed:', errorData);
            return res.status(500).json({ error: 'Failed to refresh token' });
        }

        const data = await response.json();
        const { access_token } = data;

        res.send({ access_token });

    } catch (err) {
        console.error('YouTube refresh error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
