import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CustomerDashboard.css';

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('details'); // 'details' or 'renew'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingModalType, setBookingModalType] = useState('reschedule'); // 'reschedule' or 'cancel'
  
  // Profile states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileName, setProfileName] = useState(user.email.split('@')[0].toUpperCase());
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    phone: '',
    city: '',
    address: '',
    vehicle: '',
    registration: ''
  });
  
  const [savedProfileData, setSavedProfileData] = useState({
    phone: '',
    city: '',
    address: '',
    vehicle: '',
    registration: ''
  });

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    if (profileName.trim()) {
      setIsEditingName(false);
      alert('Profile name updated successfully!');
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    setSavedProfileData(profileData);
    alert('All changes saved successfully! ✓');
  };

  const handleDiscardChanges = () => {
    setProfileData(savedProfileData);
    alert('All changes discarded.');
  };

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
            <div className="user-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="sidebar-profile-image" />
              ) : (
                '👤'
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{profileName}</p>
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
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setModalType('renew');
                          setShowModal(true);
                        }}
                      >
                        Renew Package
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setModalType('details');
                          setShowModal(true);
                        }}
                      >
                        View Details
                      </button>
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
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setBookingModalType('reschedule');
                            setShowBookingModal(true);
                          }}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setBookingModalType('cancel');
                            setShowBookingModal(true);
                          }}
                        >
                          Cancel
                        </button>
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
              <p>Manage and update your profile information</p>
            </div>

            <div className="profile-container">
              {/* Profile Header Card */}
              <div className="profile-header-card">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-container">
                    <div className="profile-avatar-large">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="profile-image" />
                      ) : (
                        <span className="avatar-placeholder">👤</span>
                      )}
                    </div>
                    <label htmlFor="photo-upload" className="photo-upload-btn">
                      📷 Change Photo
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <div className="profile-header-info">
                    <div className="profile-name-section">
                      {isEditingName ? (
                        <div className="name-edit-container">
                          <input
                            type="text"
                            className="name-edit-input"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                            autoFocus
                          />
                          <button className="btn-save-name" onClick={handleNameSave}>
                            ✓ Save
                          </button>
                          <button className="btn-cancel-name" onClick={() => {
                            setProfileName(user.email.split('@')[0].toUpperCase());
                            setIsEditingName(false);
                          }}>
                            ✕ Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="name-display-container">
                          <h2>{profileName}</h2>
                          <button className="btn-edit-name" onClick={() => setIsEditingName(true)}>
                            ✏️ Edit Name
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="profile-member-since">Member since 2024</p>
                  </div>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Account Information</h3>
                  <p>Your account details</p>
                </div>
                
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input id="email" type="email" value={user.email} readOnly />
                      <span className="readonly-note">This cannot be changed</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input id="name" type="text" value={profileName} readOnly />
                      <span className="readonly-note">Edit using the button above</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Contact Information</h3>
                  <p>Update your contact details</p>
                </div>
                
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input 
                        id="phone" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input 
                        id="city" 
                        type="text" 
                        placeholder="Enter your city" 
                        value={profileData.city}
                        onChange={(e) => handleProfileChange('city', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea 
                      id="address" 
                      placeholder="Enter your complete address"
                      value={profileData.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Additional Information</h3>
                  <p>Help us serve you better</p>
                </div>
                
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="vehicle">Vehicle Type</label>
                      <input 
                        id="vehicle" 
                        type="text" 
                        placeholder="e.g., Honda Civic, Maruti Swift" 
                        value={profileData.vehicle}
                        onChange={(e) => handleProfileChange('vehicle', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="registration">Registration Number</label>
                      <input 
                        id="registration" 
                        type="text" 
                        placeholder="e.g., GJ 01 AA 1234" 
                        value={profileData.registration}
                        onChange={(e) => handleProfileChange('registration', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="profile-form-actions">
                <button 
                  className="btn-primary btn-save-profile"
                  onClick={handleSaveProfile}
                >
                  💾 Save All Changes
                </button>
                <button 
                  className="btn-secondary"
                  onClick={handleDiscardChanges}
                >
                  🔄 Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Package Details and Renewal */}
      {showModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>

            {modalType === 'details' ? (
              <>
                <h2 className="modal-title">{selectedPackage.name}</h2>
                <div className="modal-body">
                  <div className="detail-section">
                    <h3>Package Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Price:</span>
                        <span className="info-value">{selectedPackage.price}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Status:</span>
                        <span className="info-value status-active">{selectedPackage.status}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Next Due:</span>
                        <span className="info-value">{selectedPackage.nextDue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Included Services</h3>
                    <ul className="services-list modal-services">
                      {selectedPackage.services.map((service, idx) => (
                        <li key={idx}>
                          <span className="service-icon">✓</span>
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h3>How to Use</h3>
                    <p className="info-text">
                      To book a service under this package, go to the "Book Service" section and select this package. Our mechanics will contact you within 2 hours to confirm the appointment.
                    </p>
                  </div>

                  <div className="detail-section">
                    <h3>Benefits</h3>
                    <ul className="benefits-list">
                      <li>✓ Free cancellation up to 24 hours before service</li>
                      <li>✓ Priority booking with flexible scheduling</li>
                      <li>✓ 30-day warranty on all services</li>
                      <li>✓ Dedicated customer support</li>
                    </ul>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal-title">Renew {selectedPackage.name}</h2>
                <div className="modal-body">
                  <div className="renewal-section">
                    <h3>Renewal Details</h3>
                    <div className="renewal-info">
                      <p><strong>Current Package:</strong> {selectedPackage.name}</p>
                      <p><strong>Current Price:</strong> {selectedPackage.price}</p>
                      <p><strong>Renewal Date:</strong> {selectedPackage.nextDue}</p>
                    </div>
                  </div>

                  <div className="renewal-section">
                    <h3>Renewal Options</h3>
                    <div className="renewal-options">
                      <div className="option">
                        <input type="radio" id="renew-1month" name="renewal" defaultChecked />
                        <label htmlFor="renew-1month">Renew for 1 Month - {selectedPackage.price}</label>
                      </div>
                      <div className="option">
                        <input type="radio" id="renew-3months" name="renewal" />
                        <label htmlFor="renew-3months">Renew for 3 Months - {selectedPackage.price} x 3 (Get 10% off)</label>
                      </div>
                      <div className="option">
                        <input type="radio" id="renew-6months" name="renewal" />
                        <label htmlFor="renew-6months">Renew for 6 Months - {selectedPackage.price} x 6 (Get 20% off)</label>
                      </div>
                    </div>
                  </div>

                  <div className="renewal-section">
                    <h3>Payment Method</h3>
                    <div className="payment-options">
                      <div className="payment-option">
                        <input type="radio" id="pay-online" name="payment" defaultChecked />
                        <label htmlFor="pay-online">Pay Online</label>
                      </div>
                      <div className="payment-option">
                        <input type="radio" id="pay-upi" name="payment" />
                        <label htmlFor="pay-upi">UPI/Digital Wallet</label>
                      </div>
                      <div className="payment-option">
                        <input type="radio" id="pay-cash" name="payment" />
                        <label htmlFor="pay-cash">Pay at Service Center</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      alert(`Package renewed successfully! Confirmation email will be sent to ${user.email}`);
                      setShowModal(false);
                    }}
                  >
                    Proceed with Renewal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal for Reschedule and Cancel */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>

            {bookingModalType === 'reschedule' ? (
              <>
                <h2 className="modal-title">Reschedule Booking</h2>
                <div className="modal-body">
                  <div className="booking-info-section">
                    <h3>Current Booking Details</h3>
                    <div className="booking-info-grid">
                      <div className="info-item">
                        <span className="info-label">Service:</span>
                        <span className="info-value">{selectedBooking.service}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Current Date:</span>
                        <span className="info-value">{selectedBooking.date}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Current Time:</span>
                        <span className="info-value">{selectedBooking.time}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Mechanic:</span>
                        <span className="info-value">{selectedBooking.mechanic}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-info-section">
                    <h3>Select New Date & Time</h3>
                    <div className="form-group">
                      <label htmlFor="new-date">New Date:</label>
                      <input type="date" id="new-date" min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-time">New Time:</label>
                      <select id="new-time">
                        <option value="">Select a time slot</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="02:00">02:00 PM</option>
                        <option value="03:00">03:00 PM</option>
                        <option value="04:00">04:00 PM</option>
                        <option value="05:00">05:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="booking-info-section">
                    <h3>Additional Notes (Optional)</h3>
                    <textarea 
                      placeholder="Add any special instructions or notes for rescheduling..."
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    ></textarea>
                  </div>

                  <div className="booking-info-section">
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
                      ℹ️ You can reschedule your booking up to 24 hours before the scheduled time. A confirmation email will be sent to {user.email}
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      alert('Booking rescheduled successfully! Confirmation email will be sent.');
                      setShowBookingModal(false);
                    }}
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal-title">Cancel Booking</h2>
                <div className="modal-body">
                  <div className="booking-info-section">
                    <h3>Booking Details</h3>
                    <div className="booking-info-grid">
                      <div className="info-item">
                        <span className="info-label">Service:</span>
                        <span className="info-value">{selectedBooking.service}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{selectedBooking.date}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Time:</span>
                        <span className="info-value">{selectedBooking.time}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Mechanic:</span>
                        <span className="info-value">{selectedBooking.mechanic}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-info-section warning-section">
                    <h3>⚠️ Cancellation Policy</h3>
                    <ul className="cancellation-policy">
                      <li><strong>Free Cancellation:</strong> Up to 24 hours before service - Full refund</li>
                      <li><strong>Partial Refund:</strong> Within 24 hours - 50% refund deducted</li>
                      <li><strong>No Refund:</strong> Less than 2 hours before service</li>
                    </ul>
                  </div>

                  <div className="booking-info-section">
                    <h3>Cancellation Reason</h3>
                    <div className="reason-options">
                      <div className="reason-option">
                        <input type="radio" id="reason-emergency" name="cancellation-reason" />
                        <label htmlFor="reason-emergency">Emergency / Urgent work</label>
                      </div>
                      <div className="reason-option">
                        <input type="radio" id="reason-reschedule" name="cancellation-reason" />
                        <label htmlFor="reason-reschedule">Want to reschedule</label>
                      </div>
                      <div className="reason-option">
                        <input type="radio" id="reason-no-longer" name="cancellation-reason" />
                        <label htmlFor="reason-no-longer">No longer need service</label>
                      </div>
                      <div className="reason-option">
                        <input type="radio" id="reason-other" name="cancellation-reason" />
                        <label htmlFor="reason-other">Other</label>
                      </div>
                    </div>
                  </div>

                  <div className="booking-info-section">
                    <h3>Additional Comments (Optional)</h3>
                    <textarea 
                      placeholder="Please share your feedback or reason in detail..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    ></textarea>
                  </div>

                  <div className="booking-info-section info-box">
                    <p style={{ margin: '0', color: '#1f2937', fontSize: '13px' }}>
                      Refund will be processed within 5-7 business days to your original payment method.
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Keep Booking
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      alert('Booking cancelled successfully! Refund will be processed soon.');
                      setShowBookingModal(false);
                    }}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
