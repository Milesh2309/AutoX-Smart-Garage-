import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo.jpeg';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        
        {/* Navigation */}
        <nav>
          <ul className="nav-links">
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/services" className={isActive('/services') ? 'active' : ''}>Services</Link></li>
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link></li>
            <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
            <li><Link to="/login" className={`nav-auth ${isActive('/login') ? 'active' : ''}`}>Login</Link></li>
          </ul>
        </nav>

        {/* Centered tagline inline */}
        <div className="tagline">SMART GARAGE · BREAKDOWN · MODIFICATION</div>

        {/* Logo */}
        <div className="logo">
          <span className="logo-text">AutoX</span>
          <img src={logo} alt="AutoX Logo" className="logo-img" />
        </div>

      </div>
    </header>
  );
}

export default Header;
