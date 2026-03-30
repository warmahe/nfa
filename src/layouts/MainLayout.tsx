import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "HOME", href: "/" },
    { label: "DESTINATIONS", href: "/destinations" },
    { label: "PACKAGES", href: "/packages" },
    { label: "GALLERY", href: "/gallery" },
    { label: "WISHLIST", href: "/wishlist" },
    { label: "PRICE ALERTS", href: "/price-alerts" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "BLOG", href: "/blog" }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 h-12">
            <img src="/logo.svg" alt="No Fixed Address" className="h-12 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-teal-700 p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 p-4 md:p-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-teal-700 mb-4">NO FIXED ADDRESS</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Premium travel experiences designed for adventurers who demand excellence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">TRAVELERS</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/destinations" className="hover:text-teal-700 transition-colors">Explore Destinations</Link></li>
              <li><Link to="/packages" className="hover:text-teal-700 transition-colors">Browse Packages</Link></li>
              <li><Link to="/gallery" className="hover:text-teal-700 transition-colors">Gallery</Link></li>
              <li><Link to="/dashboard" className="hover:text-teal-700 transition-colors">Dashboard</Link></li>
              <li><Link to="/faq" className="hover:text-teal-700 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">COMPANY</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-teal-700 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-teal-700 transition-colors">Blog</Link></li>
              <li><Link to="/testimonials" className="hover:text-teal-700 transition-colors">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">CONTACT</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="mailto:hello@nofixedaddress.cc" className="hover:text-teal-700 transition-colors">hello@nofixedaddress.cc</a></li>
              <li><a href="tel:+41225187000" className="hover:text-teal-700 transition-colors">+41 22 518 7000</a></li>
              <li className="text-xs text-gray-500">GENEVA HQ</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 md:px-6 py-6 text-center text-xs text-gray-500">
          <p>&copy; 2026 NO FIXED ADDRESS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
