import React, { useState } from 'react';

function AdminSettings() {
  const [settings, setSettings] = useState({
    businessName: 'AutoX',
    email: 'autox.service@gmail.com',
    phone: '+91 93287 64024',
    address: 'Ahmedabad, Gujarat',
    hours: '24/7 Available',
    maintenanceModeEnabled: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>⚙️ Admin Settings</h1>
      </div>

      <div className="settings-container">
        <div className="settings-form">
          <h2>Business Information</h2>
          
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={settings.businessName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Business Hours</label>
            <input
              type="text"
              name="hours"
              value={settings.hours}
              onChange={handleChange}
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              name="maintenanceModeEnabled"
              checked={settings.maintenanceModeEnabled}
              onChange={handleChange}
              id="maintenance"
            />
            <label htmlFor="maintenance">Enable Maintenance Mode</label>
          </div>

          <button className="btn-primary" onClick={handleSave}>Save Settings</button>
        </div>

        <div className="settings-info">
          <h2>System Info</h2>
          <div className="info-item">
            <span>Version:</span>
            <strong>1.0.0</strong>
          </div>
          <div className="info-item">
            <span>Last Updated:</span>
            <strong>Dec 30, 2025</strong>
          </div>
          <div className="info-item">
            <span>Status:</span>
            <strong className="status-active">Online</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
