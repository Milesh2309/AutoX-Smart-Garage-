import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo.jpeg';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

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

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
            {/* Notification Bell - Only show when authenticated */}
            {isAuthenticated && (
              <div className="notification-wrapper">
                <button 
                  className="notification-bell"
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      <div className="notification-actions">
                        {unreadCount > 0 && (
                          <button 
                            className="mark-all-read"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            className="clear-all"
                            onClick={clearNotifications}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="notification-icon">{notification.icon}</div>
                            <div className="notification-content">
                              <h4>{notification.title}</h4>
                              <p>{notification.message}</p>
                              <span className="notification-time">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="notification-dot"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
