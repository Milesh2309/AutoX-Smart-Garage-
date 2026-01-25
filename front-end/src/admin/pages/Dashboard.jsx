import React, { useState } from 'react';

function Dashboard({ onNavigate }) {
  const goTo = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };
  const [stats] = useState({
    totalBookings: 156,
    totalUsers: 342,
    activeServices: 8,
    totalVehicles: 428,
    totalRevenue: '₹2,45,600',
    dailyRevenue: '₹8,200',
    monthlyRevenue: '₹2,45,600',
    yearlyRevenue: '₹28,90,000',
    monthlyGrowth: '+12.5%',
    completedServices: 298
  });

  const [activities] = useState([
    { id: 1, type: 'booking', name: 'John Doe', action: 'booked Smart Garage Services', time: '2 hours ago', icon: '📅' },
    { id: 2, type: 'user', name: 'Sarah Smith', action: 'registered as new user', time: '4 hours ago', icon: '👤' },
    { id: 3, type: 'service', name: 'Vehicle Detailing', action: 'service completed for Raj Patel', time: '6 hours ago', icon: '✨' },
    { id: 4, type: 'booking', name: 'Priya Gupta', action: 'booked Emergency Roadside Help', time: '8 hours ago', icon: '📅' },
    { id: 5, type: 'review', name: 'Customer', action: 'left 5-star review', time: '10 hours ago', icon: '⭐' }
  ]);

  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const closeActivityDetails = () => {
    setSelectedActivity(null);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p className="header-subtitle">Welcome to AutoX Admin Dashboard</p>
        </div>
        <div className="header-date">
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => goTo('bookings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
          aria-label="View all bookings"
        >
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
            <span className="stat-growth">↑ {stats.monthlyGrowth} this month</span>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => goTo('users')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('users')}
          aria-label="View active customers"
        >
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-growth">Active customers</span>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => goTo('services')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('services')}
          aria-label="View active services"
        >
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>Active Services</h3>
            <p className="stat-value">{stats.activeServices}</p>
            <span className="stat-growth">{stats.completedServices} completed</span>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => goTo('bookings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
          aria-label="View total vehicles"
        >
          <div className="stat-icon">🚘</div>
          <div className="stat-content">
            <h3>Total Vehicles</h3>
            <p className="stat-value">{stats.totalVehicles}</p>
            <span className="stat-growth">Serviced vehicles</span>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => goTo('bookings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
          aria-label="View monthly earnings"
        >
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{stats.totalRevenue}</p>
            <span className="stat-growth">Monthly earnings</span>
            <div className="revenue-breakdown">
              <span className="revenue-pill">Daily: {stats.dailyRevenue}</span>
              <span className="revenue-pill">Monthly: {stats.monthlyRevenue}</span>
              <span className="revenue-pill">Yearly: {stats.yearlyRevenue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>📈 Quick Stats</h2>
          <div className="quick-stats">
            <div 
              className="quick-stat clickable"
              onClick={() => goTo('bookings')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
              aria-label="View bookings this week"
            >
              <label>Bookings This Week</label>
              <span>42</span>
            </div>
            <div 
              className="quick-stat clickable"
              onClick={() => goTo('bookings')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
              aria-label="View pending services"
            >
              <label>Pending Services</label>
              <span>8</span>
            </div>
            <div 
              className="quick-stat clickable"
              onClick={() => goTo('bookings')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
              aria-label="View in-progress services"
            >
              <label>In-Progress</label>
              <span>12</span>
            </div>
            <div 
              className="quick-stat clickable"
              onClick={() => goTo('bookings')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('bookings')}
              aria-label="View completed services"
            >
              <label>Completed</label>
              <span>24</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>🎯 Performance</h2>
          <div className="performance-chart">
            <div className="performance-item">
              <label>Service Satisfaction</label>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '94%'}}></div>
              </div>
              <span>94%</span>
            </div>
            <div className="performance-item">
              <label>On-Time Completion</label>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '88%'}}></div>
              </div>
              <span>88%</span>
            </div>
            <div className="performance-item">
              <label>Customer Retention</label>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '92%'}}></div>
              </div>
              <span>92%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>🔔 Recent Activity</h2>
        <div className="activity-list">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-item clickable"
              onClick={() => handleActivityClick(activity)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleActivityClick(activity)}
              aria-label={`View details for ${activity.name} ${activity.action}`}
            >
              <span className="activity-icon">{activity.icon}</span>
              <div className="activity-info">
                <p><strong>{activity.name}</strong> {activity.action}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedActivity && (
        <div className="modal-backdrop" onClick={closeActivityDetails}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-label">Activity Details</p>
                <h3>{selectedActivity.icon} {selectedActivity.name}</h3>
              </div>
              <button className="modal-close" onClick={closeActivityDetails} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p><strong>Activity Type:</strong> {selectedActivity.type.charAt(0).toUpperCase() + selectedActivity.type.slice(1)}</p>
              <p><strong>Action:</strong> {selectedActivity.action}</p>
              <p><strong>Time:</strong> {selectedActivity.time}</p>
              <p><strong>Status:</strong> <span className="status status-completed">Recorded</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
