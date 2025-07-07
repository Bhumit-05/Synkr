import React, { useState } from 'react';
import SearchBar from './SearchBar';
import TrackResults from './TrackResults';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto mt-[15%] md:mt-[10%]">
        <h1 className="text-4xl font-light mb-8 text-center">🎧 Track Search</h1>
        <SearchBar onSearch={setQuery} setSearching={setSearching} />
        {searching && (
          <p className="text-gray-400 my-6 text-center text-lg">
            Showing results for <span className="text-white font-medium">"{query}"</span>
          </p>
        )}
        <TrackResults keyword={query} />
      </div>
    </div>
  );
};

export default Search;
