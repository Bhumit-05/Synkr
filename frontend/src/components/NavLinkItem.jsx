import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLinkItem = ({ to, label }) => {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm px-4 py-2 rounded-xl transition-all ${
        isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-300'
      }`}
    >
      {label}
    </Link>
  );
};

export default NavLinkItem;
