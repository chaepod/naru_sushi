import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import './MobileMenu.css';

export default function MobileMenu({ menuItems, isAuthenticated, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    toggleMenu();
    onLogout();
  };

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'tween',
        duration: 0.3
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Mobile Header Bar - Only visible below 768px */}
      <div className="mobile-header">
        <button
          onClick={toggleMenu}
          className="mobile-menu-button"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <HiX style={{ width: '24px', height: '24px' }} />
          ) : (
            <HiMenu style={{ width: '24px', height: '24px' }} />
          )}
        </button>

        <div className="mobile-brand">
          🍱 Naru Sushi
        </div>

        <div className="mobile-cart">
          <CartIcon />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={toggleMenu}
              className="mobile-menu-overlay"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="mobile-menu-panel"
            >
              {/* Close button inside the menu */}
              <button
                onClick={toggleMenu}
                className="mobile-menu-close-btn"
                aria-label="Close menu"
              >
                <HiX style={{ width: '28px', height: '28px' }} />
              </button>

              <div className="mobile-menu-content">
                {/* Logo/Brand */}
                <div className="mobile-menu-header">
                  <h2 className="mobile-menu-title">🍱 Naru Sushi</h2>
                  <p className="mobile-menu-subtitle">Fresh & Delicious</p>
                </div>

                {/* Navigation Links */}
                <nav className="mobile-menu-nav">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      onClick={toggleMenu}
                      className="mobile-menu-link"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Sticky Logout Button */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="mobile-logout-btn-sticky"
                >
                  Logout
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
