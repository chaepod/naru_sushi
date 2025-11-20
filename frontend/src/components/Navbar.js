import React from "react";
import { Link } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import CartIcon from "./CartIcon";
import "./Navbar.css";

function Navbar() {
  const menuItems = [
    { label: "Menu", href: "/" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <>
      {/* Mobile Menu Component */}
      <MobileMenu menuItems={menuItems} />

      {/* Desktop Navbar - Hidden on mobile */}
      <nav className="hidden lg:flex bg-white shadow-md p-4">
        {/* Your existing navbar content */}
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold">Naru Sushi</div>

          {/* Desktop Navigation Links */}
          <div className="flex space-x-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Shopping Cart Icon */}
          <CartIcon />
        </div>
      </nav>
    </>
  );
}

export default Navbar;
