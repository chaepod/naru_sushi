import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import './Navbar.css';

function Navbar() {
  const menuItems = [
    { label: "Menu", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <>
      {/* Mobile Menu - Only shows on screens < 768px */}
      <MobileMenu menuItems={menuItems} />

      {/* Desktop Navbar - Original design, hidden on mobile */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🍱 Naru Sushi
          </Link>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Menu</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </div>
          <CartIcon />
        </div>
      </nav>
    </>
  );
}

export default Navbar;
