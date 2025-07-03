const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

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
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 4000;

app.use('/spotifyAuth', spotifyAuthRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/youtubeAuth', youtubeAuthRoutes);
app.use('/youtube', youtubeRoutes);
app.use('/sync', spotifyToYoutubeRoute);
app.use('/sync', youtubeToSpotifyRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
