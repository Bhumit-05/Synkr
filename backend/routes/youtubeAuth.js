const express = require('express');
const querystring = require('querystring');
const dotenv = require('dotenv');
const { youtubeUser } = require('../models/User');

dotenv.config();

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const YT_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'openid',
    'email',
    'profile'
];


// Step 1: Redirect to YouTube login
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

// Step 2: Handle callback and save tokens to DB
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Step 1: Exchange code for tokens
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

        // Step 2: Fetch user info
        const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoRes.ok) {
            const errorData = await userInfoRes.text();
            console.error('Failed to fetch user info:', errorData);
            return res.status(500).send('Failed to fetch user info');
        }

        const { sub: id, email } = await userInfoRes.json();

        // Step 3: Save user in DB
        await youtubeUser.findOneAndUpdate(
            { youtubeId: id },
            {
                youtubeId: id,
                email,
                youtubeAccessToken: access_token,
                youtubeRefreshToken: refresh_token,
            },
            { upsert: true, new: true }
        );

        res.send({ access_token, refresh_token, user: { id, email } });

    } catch (err) {
        console.error('YouTube OAuth error:', err.message);
        res.status(500).send('YouTube OAuth failed');
    }
});


// Step 3: Refresh access token using refresh token
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

        // Update user in DB
        const user = await youtubeUser.findOneAndUpdate(
            { youtubeRefreshToken: refreshToken },
            { youtubeAccessToken: access_token },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.send({ access_token });

    } catch (err) {
        console.error('YouTube refresh error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
