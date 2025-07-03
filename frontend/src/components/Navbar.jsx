import React from 'react';
import { Link } from 'react-router-dom';
import NavLinkItem from './NavLinkItem'; // adjust path if needed

const Navbar = () => {
  return (
    <nav className="text-white px-6 py-4 flex justify-between items-center shadow-lg fixed w-[95%] left-1/2 -translate-x-1/2 top-6 rounded-3xl h-14 bg-blue-900/40 backdrop-blur-md z-50 border border-white/10">
      <h1 className="text-xl font-light tracking-wider">
        <Link to="/" className="hover:text-blue-200 transition">
          Synkr 🎵
        </Link>
      </h1>

      <div className="flex gap-4">
        <NavLinkItem to="/" label="Home" />
        <NavLinkItem to="/dashboard" label="Dashboard" />
        <NavLinkItem to="/about" label="About" />
        <NavLinkItem to="/settings" label="Settings" />
      </div>
    </nav>
  );
};

export default Navbar;
