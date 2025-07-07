const express = require('express');
const router = express.Router();

router.post('/spotify-to-youtube', async (req, res) => {
    const { spotifyToken, youtubeToken, playlistId, playlistTitle } = req.body;

    if (!spotifyToken || !youtubeToken || !playlistId) {
        return res.status(400).json({ error: 'Missing token or playlist ID' });
    }

    try {
        // Getting Spotify tracks
        const spotifyTracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,{
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            },
        }
        );

        if (!spotifyTracksRes.ok) {
            const errData = await spotifyTracksRes.json();
            throw new Error(`Spotify API error: ${JSON.stringify(errData)}`);
        }

        const spotifyTracks = await spotifyTracksRes.json();

        const tracks = spotifyTracks.items.map(item => {
            const track = item.track;
            return `${track.name} ${track.artists[0].name}`;
        });

        // Creating a new YouTube playlist
        const ytCreateRes = await fetch(
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',{
            method: 'POST',
            headers: {
                Authorization: `Bearer ${youtubeToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    title: playlistTitle + " - Synkr",
                    description: 'Created by Synkr',
                },
                status: {
                    privacyStatus: 'private',
                },
            }),
        });

        if (!ytCreateRes.ok) {
            const errData = await ytCreateRes.json();
            throw new Error(`YouTube playlist creation error: ${JSON.stringify(errData)}`);
        }

        const ytCreateData = await ytCreateRes.json();
        const youtubePlaylistId = ytCreateData.id;

        // Adding each track to the new YouTube playlist
        for (const query of tracks) {
            const searchRes = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&maxResults=1`,
                {
                headers: {
                    Authorization: `Bearer ${youtubeToken}`,
                },
                }
            );

            if (!searchRes.ok) continue;

            const searchData = await searchRes.json();
            const videoId = searchData.items[0]?.id?.videoId;
            if (!videoId) continue;

            // Attempt 1 failed for video CfihYWRWRTQ: SERVICE_UNAVAILABLE
            const tryAddVideo = async (retries = 2) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
                const addVideoRes = await fetch(
                'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',{
                    method: 'POST',
                    headers: {
                    Authorization: `Bearer ${youtubeToken}`,
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                    snippet: {
                        playlistId: youtubePlaylistId,
                        resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId,
                        },
                    },
                    }),
                });

                if (addVideoRes.ok) return true;

                const errData = await addVideoRes.json();
                const reason = errData?.error?.errors?.[0]?.reason;

                console.warn(`Attempt ${attempt} failed for video ${videoId}: ${reason}`);

                if (reason === 'SERVICE_UNAVAILABLE' && attempt < retries) {
                    await new Promise(res => setTimeout(res, 1000)); // waiting 1s and retry
                } else {
                    return false;
                }
            }
            };

            await tryAddVideo();

        }

        res.json({ success: true, youtubePlaylistId });
    } catch (err) {
        console.error('Sync error:', err.message);
        res.status(500).json({ error: 'Failed to sync playlist' });
    }
});

module.exports = router;
