const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const spotifyAuthRoutes = require('./routes/spotifyAuth');
const spotifyRoutes = require('./routes/spotify');
const youtubeAuthRoutes = require('./routes/youtubeAuth');
const youtubeRoutes = require('./routes/youtube');
const youtubeToSpotifyRoute = require('./routes/sync/youtube-to-spotify');
const spotifyToYoutubeRoute = require('./routes/sync/spotify-to-youtube');

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'https://synkr-xi.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Synkr backend running!');
});

app.use('/spotifyAuth', spotifyAuthRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/youtubeAuth', youtubeAuthRoutes);
app.use('/youtube', youtubeRoutes);
app.use('/sync', spotifyToYoutubeRoute);
app.use('/sync', youtubeToSpotifyRoute);

app.listen(PORT, '0.0.0.0');