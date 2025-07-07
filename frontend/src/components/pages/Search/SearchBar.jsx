import React, { useState } from 'react';

const SearchBar = ({ onSearch, setSearching }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSearching(true);
    onSearch(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center gap-2 mb-6">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for a track..."
        className="w-full max-w-md bg-slate-800 text-white px-4 py-2 text-sm rounded-lg border border-slate-600 focus:outline-none"/>

      <button
        type="submit"
        className="bg-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
