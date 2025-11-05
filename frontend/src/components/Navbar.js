import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🍱 Naru Sushi
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Menu</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </div>
        <CartIcon />
      </div>
    </nav>
  );
}

export default Navbar;