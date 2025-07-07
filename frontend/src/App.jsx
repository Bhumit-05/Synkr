import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import SpotifyCallback from './components/SpotifyCallback';
import YouTubeCallback from './components/YoutubeCallback';
import YoutubePlaylistDetails from './components/pages/YoutubePlaylistDetails';
import SpotifyPlaylistDetails from './components/pages/SpotifyPlaylistDetails';
import Search from './components/pages/Search/Search';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search/>} />
        <Route path="/spotify/callback" element={<SpotifyCallback />} />
        <Route path="/youtube/callback" element={<YouTubeCallback />} />
        <Route path="/playlist/youtube/:id/:PlaylistTitle" element={<YoutubePlaylistDetails />} />
        <Route path="/playlist/spotify/:id/:PlaylistTitle" element={<SpotifyPlaylistDetails />} />
      </Routes>
    </Router>
  );
}

export default App;