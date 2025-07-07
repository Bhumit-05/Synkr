import React, { useEffect, useState } from 'react';
import SpotifyResults from './SpotifyResults';
import YouTubeResults from './YoutubeResults';
import {refreshYouTubeToken, refreshSpotifyToken} from "../../../utils/refresh";

const TrackResults = ({ keyword }) => {
  const [spotify, setSpotify] = useState([]);
  const [youtube, setYouTube] = useState([]);

  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      try {
        const spotifyToken = await refreshSpotifyToken();
        const youtubeToken = await refreshYouTubeToken();

        const [spotifyRes, youtubeRes] = await Promise.all([
          fetch(`https://synkr-vtpk.onrender.com/spotify/search?query=${encodeURIComponent(keyword)}`, {
            headers: {
              'Authorization': `Bearer ${spotifyToken}`,
            },
          }),
          fetch(`https://synkr-vtpk.onrender.com/youtube/search?query=${encodeURIComponent(keyword)}`, {
            headers: {
              'Authorization': `Bearer ${youtubeToken}`,
            },
          }),
        ]);

        const spotifyData = await spotifyRes.json();
        const youtubeData = await youtubeRes.json();

        setSpotify(spotifyData.tracks || []);
        setYouTube(youtubeData || []);
      } catch (err) {
        console.error('Search error:', err.message);
      }
    };

    fetchResults();
  }, [keyword]);

  return (
    <div className="grid grid-cols-1 sm:flex lg:flex-row mt-20">
      <SpotifyResults tracks={spotify} />
      <div className='border-l lg:ml-40 border-gray-600/50'></div>
      <div className='border-t my-20 mx-10 border-gray-600/50'></div>
      <YouTubeResults tracks={youtube} />
    </div>
  );
};

export default TrackResults;
