const mongoose = require('mongoose');

const spotifyUserSchema = new mongoose.Schema({
    spotifyId: String,
    email: String,
    accessToken: String,
    refreshToken: String,
});

const youtubeUserSchema = new mongoose.Schema({
    youtubeId: { type: String, required: true, unique: true },
    email: String,
    youtubeAccessToken: String,
    youtubeRefreshToken: String,
});

const spotifyUser = mongoose.model('spotifyUser', spotifyUserSchema);
const youtubeUser = mongoose.model('youtubeUser', youtubeUserSchema);

module.exports = {
  spotifyUser,
  youtubeUser,
};
