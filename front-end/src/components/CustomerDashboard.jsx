import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CustomerDashboard.css';

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  // Mock data for service packages
  const servicePackages = [
    {
      id: 1,
      name: 'Basic Service',
      price: '₹500',
      status: 'Active',
      nextDue: '2026-02-15',
      services: ['Oil Change', 'Filter Change', 'Car Wash']
    },
    {
      id: 2,
      name: 'Premium Service',
      price: '₹1500',
      status: 'Active',
      nextDue: '2026-03-20',
      services: ['Complete Checkup', 'Maintenance', 'Detailing']
    },
    {
      id: 3,
      name: 'Breakdown Assistance',
      price: '₹300/month',
      status: 'Active',
      nextDue: 'Always Available',
      services: ['24/7 Support', 'Towing', 'Emergency Service']
    }
  ];

  // Mock data for service history
  const serviceHistory = [
    {
      id: 1,
      date: '2026-01-10',
      service: 'Regular Service',
      amount: '₹500',
      status: 'Completed',
      mechanic: 'Rajesh Patel'
    },
    {
      id: 2,
      date: '2025-12-25',
      service: 'Breakdown Service',
      amount: '₹1200',
      status: 'Completed',
      mechanic: 'Vikram Singh'
    },
    {
      id: 3,
      date: '2025-12-10',
      service: 'Tire Change',
      amount: '₹800',
      status: 'Completed',
      mechanic: 'Rajesh Patel'
    },
    {
      id: 4,
      date: '2025-11-15',
      service: 'Modification Consultation',
      amount: '₹2000',
      status: 'Completed',
      mechanic: 'Arun Kumar'
    }
  ];

  // Mock data for bookings
  const upcomingBookings = [
    {
      id: 1,
      service: 'Premium Service',
      date: '2026-02-15',
      time: '10:00 AM',
      status: 'Confirmed',
      mechanic: 'Rajesh Patel'
    }
  ];

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'packages', label: 'My Packages', icon: '📦' },
    { id: 'history', label: 'Service History', icon: '✓' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="customer-dashboard">
      {/* Sidebar Navigation */}
      <nav className="customer-nav">
        <div className="customer-nav-header">
          <h2>AutoX</h2>
          <p>Customer Portal</p>
        </div>

        <ul className="customer-nav-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="customer-nav-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <p className="user-name">{user.email.split('@')[0].toUpperCase()}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="customer-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="content-section">
            <div className="section-header">
              <h1>Welcome Back, {user.email.split('@')[0].toUpperCase()}</h1>
              <p>Here's your service summary</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{servicePackages.length}</h3>
                  <p>Active Packages</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-info">
                  <h3>{serviceHistory.length}</h3>
                  <p>Services Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{upcomingBookings.length}</h3>
                  <p>Upcoming Bookings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>4.8</h3>
                  <p>Your Rating</p>
                </div>
              </div>
            </div>

            {/* Active Packages */}
            <div className="content-card">
              <h2>Your Active Packages</h2>
              <div className="packages-grid">
                {servicePackages.map(pkg => (
                  <div key={pkg.id} className="package-card">
                    <div className="package-header">
                      <h3>{pkg.name}</h3>
                      <span className="package-status">{pkg.status}</span>
                    </div>
                    <div className="package-price">{pkg.price}</div>
                    <div className="package-next">Next Due: {pkg.nextDue}</div>
                    <div className="package-services">
                      {pkg.services.slice(0, 2).map((s, i) => (
                        <span key={i} className="service-badge">{s}</span>
                      ))}
                    </div>
                    <button className="view-details-btn">View Details</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Services */}
            <div className="content-card">
              <h2>Recent Services</h2>
              <div className="history-list">
                {serviceHistory.slice(0, 3).map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-info">
                      <h4>{item.service}</h4>
                      <p>{item.date} • By {item.mechanic}</p>
                    </div>
                    <div className="history-amount">{item.amount}</div>
                    <span className="status-badge">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="content-section">
            <div className="section-header">
              <h1>My Service Packages</h1>
              <p>Manage your active packages</p>
            </div>

            <div className="content-card">
              <div className="packages-grid full-width">
                {servicePackages.map(pkg => (
                  <div key={pkg.id} className="package-card large">
                    <div className="package-header">
                      <h3>{pkg.name}</h3>
                      <span className="package-status">{pkg.status}</span>
                    </div>
                    <div className="package-details">
                      <div className="detail-row">
                        <span className="label">Price:</span>
                        <span className="value">{pkg.price}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Status:</span>
                        <span className="value">{pkg.status}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Next Due:</span>
                        <span className="value">{pkg.nextDue}</span>
                      </div>
                    </div>
                    <div className="services-section">
                      <h4>Included Services:</h4>
                      <ul className="services-list">
                        {pkg.services.map((s, i) => (
                          <li key={i}>✓ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="package-actions">
                      <button className="btn-primary">Renew Package</button>
                      <button className="btn-secondary">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="content-section">
            <div className="section-header">
              <h1>Service History</h1>
              <p>All your completed services</p>
            </div>

            <div className="content-card">
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Mechanic</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceHistory.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.service}</td>
                        <td>{item.mechanic}</td>
                        <td className="amount">{item.amount}</td>
                        <td>
                          <span className="status-badge">{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="content-section">
            <div className="section-header">
              <h1>My Bookings</h1>
              <p>Your upcoming service bookings</p>
            </div>

            <div className="content-card">
              {upcomingBookings.length > 0 ? (
                <div className="bookings-list">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.service}</h3>
                        <span className="booking-status">{booking.status}</span>
                      </div>
                      <div className="booking-details">
                        <div className="detail">
                          <span className="label">📅 Date:</span>
                          <span className="value">{booking.date}</span>
                        </div>
                        <div className="detail">
                          <span className="label">🕐 Time:</span>
                          <span className="value">{booking.time}</span>
                        </div>
                        <div className="detail">
                          <span className="label">👨‍🔧 Mechanic:</span>
                          <span className="value">{booking.mechanic}</span>
                        </div>
                      </div>
                      <div className="booking-actions">
                        <button className="btn-secondary">Reschedule</button>
                        <button className="btn-danger">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No upcoming bookings</p>
                  <button className="btn-primary">Book a Service</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="content-section">
            <div className="section-header">
              <h1>My Profile</h1>
              <p>Update your profile information</p>
            </div>

            <div className="content-card">
              <div className="profile-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={user.email.split('@')[0].toUpperCase()} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="Add your phone number" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea placeholder="Enter your address"></textarea>
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="Enter your city" />
                </div>
                <div className="form-actions">
                  <button className="btn-primary">Save Changes</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
