import React from 'react';

function AdminNav({ currentPage, setCurrentPage, adminUsername, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'services', label: 'Services', icon: '🚗' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚙' },
    { id: 'breakdown', label: 'Breakdowns', icon: '🚘' },
    { id: 'mechanics', label: 'Mechanics', icon: '🔧' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'modifications', label: 'Modifications', icon: '⚙️' },
    { id: 'repairs', label: 'Repairs', icon: '🔧' },
    { id: 'contacts', label: 'Contacts', icon: '📩' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '🛠️' },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav-header">
        <h2>AutoX Admin</h2>
        <p>Welcome, {adminUsername}</p>
      </div>

      <ul className="admin-nav-menu">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="admin-nav-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNav;
