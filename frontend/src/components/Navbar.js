import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: "Menu", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  if (isAuthenticated) {
    menuItems.push({ label: "Admin", href: "/admin" });
  } else {
    menuItems.push({ label: "Login", href: "/login" });
  }

  return (
    <>
      {/* Mobile Menu - Only shows on screens < 768px */}
      <MobileMenu menuItems={menuItems} isAuthenticated={isAuthenticated} onLogout={handleLogout} />

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
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="nav-link">Admin</Link>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </div>
          <CartIcon />
        </div>
      </nav>
    </>
  );
}

export default Navbar;
