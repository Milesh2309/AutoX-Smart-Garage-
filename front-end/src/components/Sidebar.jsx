import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo.jpeg';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, role, logout } = useAuth();

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

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const toggleServicesDropdown = (e) => {
    if (window.innerWidth <= 768) {
      if (servicesDropdownOpen) {
        // If dropdown is already open, allow navigation
        closeMobile();
      } else {
        // If dropdown is closed, prevent navigation and open dropdown
        e.preventDefault();
        setServicesDropdownOpen(true);
      }
    }
  };

  const toggleAboutDropdown = (e) => {
    if (window.innerWidth <= 768) {
      if (aboutDropdownOpen) {
        // If dropdown is already open, allow navigation
        closeMobile();
      } else {
        // If dropdown is closed, prevent navigation and open dropdown
        e.preventDefault();
        setAboutDropdownOpen(true);
      }
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
     
     

      {/* Top Navbar */}
      <nav className={`navbar ${isMobileOpen ? 'mobile-open' : ''} ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo Section */}
            <div className="navbar-brand">
              <img src={logo} alt="AutoX Logo" className="navbar-logo" />
              <div className="navbar-brand-text">
                <span className="navbar-text">AutoX</span>
                <span className="navbar-subtext">SMART GARAGE · BREAKDOWN · MODIFICATION</span>
              </div>
          </div>

          {/* Tagline */}
          <div className="navbar-tagline">SMART GARAGE · BREAKDOWN · MODIFICATION</div>

          {/* Nav Links */}
          <ul className="navbar-links">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Home
              </Link>
            </li>
            <li 
              className={`nav-dropdown ${servicesDropdownOpen ? 'sticky-open' : ''}`}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link 
                to="/services" 
                className={`nav-link ${isActive('/services') || isActive('/service-catalog') || isActive('/breakdown/call') || isActive('/mods/explore') ? 'active' : ''}`}
                onClick={toggleServicesDropdown}
              >
                Services
                <span className="dropdown-arrow">▼</span>
              </Link>
              {servicesDropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link 
                      to="/service-catalog" 
                      className="dropdown-item"
                      onClick={closeMobile}
                    >
                      REGULAR SERVICE
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/breakdown/call" 
                      className="dropdown-item"
                      onClick={closeMobile}
                    >
                      BREAKDOWN
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/mods/explore" 
                      className="dropdown-item"
                      onClick={closeMobile}
                    >
                      MODIFICATION
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li 
              className={`nav-dropdown ${aboutDropdownOpen ? 'sticky-open' : ''}`}
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <div className="nav-link-wrapper">
                <Link 
                  to="/about" 
                  className={`nav-link ${isActive('/about') || isActive('/gallery') ? 'active' : ''}`}
                  onClick={(e) => {
                    if (window.innerWidth > 768) {
                      // Desktop: allow direct navigation
                      closeMobile();
                    } else {
                      // Mobile: toggle dropdown
                      toggleAboutDropdown(e);
                    }
                  }}
                >
                  About
                  <span className="dropdown-arrow">▼</span>
                </Link>
              </div>
              {aboutDropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link 
                      to="/gallery" 
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMobile();
                        setAboutDropdownOpen(false);
                      }}
                    >
                      GALLERY
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated && role === 'admin' ? (
              <>
                <Link 
                  to="/admin" 
                  className={`auth-link login-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  Admin Dashboard
                </Link>
                <button 
                  className="auth-link login-link"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  Logout
                </button>
              </>
            ) : isAuthenticated && role === 'user' ? (
              <>
                <Link 
                  to="/customer/dashboard" 
                  className={`auth-link login-link ${isActive('/customer/dashboard') ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  My Dashboard
                </Link>
                <button 
                  className="auth-link login-link"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`auth-link login-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`auth-link register-link ${isActive('/register') ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
         <button className="navbar-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
        </button>
         
      </nav>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="navbar-backdrop" onClick={() => setIsMobileOpen(false)}></div>
      )}
    </>
  );
}

export default Navbar;
