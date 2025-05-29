const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const spotifyAuthRoutes = require('./routes/spotifyAuth');
const spotifyRoutes = require('./routes/spotify');
const youtubeAuthRoutes = require('./routes/youtubeAuth');
const youtubeRoutes = require('./routes/youtube');
const syncRoutes = require('./routes/sync');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json())
const PORT = process.env.PORT || 4000;

app.use("/spotifyAuth", spotifyAuthRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/youtubeAuth", youtubeAuthRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/sync", syncRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
