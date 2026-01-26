import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMechanics: 0,
    totalVehicles: 0,
    totalParts: 0,
    totalBookings: 0,
    totalServices: 0,
    totalBreakdowns: 0,
    totalModifications: 0,
  });

  // Simulated data - replace with API calls
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockStats = {
          totalUsers: 245,
          totalMechanics: 18,
          totalVehicles: 312,
          totalParts: 1560,
          totalBookings: 892,
          totalServices: 156,
          totalBreakdowns: 48,
          totalModifications: 67,
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const reportCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: '#3b82f6',
      description: 'Registered customers',
    },
    {
      id: 'mechanics',
      title: 'Total Mechanics',
      value: stats.totalMechanics,
      icon: '🔧',
      color: '#10b981',
      description: 'Active mechanics',
    },
    {
      id: 'vehicles',
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: '🚗',
      color: '#f59e0b',
      description: 'Registered vehicles',
    },
    {
      id: 'parts',
      title: 'Total Parts',
      value: stats.totalParts,
      icon: '📦',
      color: '#8b5cf6',
      description: 'In inventory',
    },
    {
      id: 'bookings',
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: '📅',
      color: '#ec4899',
      description: 'Service bookings',
    },
    {
      id: 'services',
      title: 'Total Services',
      value: stats.totalServices,
      icon: '🛠',
      color: '#06b6d4',
      description: 'Services offered',
    },
    {
      id: 'breakdowns',
      title: 'Total Breakdowns',
      value: stats.totalBreakdowns,
      icon: '🚘',
      color: '#dc2626',
      description: 'Handled requests',
    },
    {
      id: 'modifications',
      title: 'Total Modifications',
      value: stats.totalModifications,
      icon: '⚙️',
      color: '#6366f1',
      description: 'Completed mods',
    },
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 System Reports</h1>
        <p>Complete overview of all system statistics and metrics</p>
      </div>

      <div className="reports-grid">
        {reportCards.map((card) => (
          <div key={card.id} className="report-card">
            <div className="report-card-header">
              <div className="report-icon" style={{ backgroundColor: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
            </div>
            <div className="report-card-value">
              {card.value}
            </div>
            <p className="report-card-description">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="reports-summary">
        <div className="summary-section">
          <h2>📈 Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Active Users This Month</label>
              <span className="metric-value">{Math.round(stats.totalUsers * 0.65)}</span>
            </div>
            <div className="metric-item">
              <label>Mechanics Efficiency Rate</label>
              <span className="metric-value">92%</span>
            </div>
            <div className="metric-item">
              <label>Average Booking Value</label>
              <span className="metric-value">₹2,450</span>
            </div>
            <div className="metric-item">
              <label>Customer Satisfaction</label>
              <span className="metric-value">4.8/5</span>
            </div>
            <div className="metric-item">
              <label>Parts Inventory Usage</label>
              <span className="metric-value">68%</span>
            </div>
            <div className="metric-item">
              <label>Avg Service Completion Time</label>
              <span className="metric-value">2.3 hrs</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>💰 Revenue Summary</h2>
          <div className="revenue-grid">
            <div className="revenue-item">
              <label>This Month</label>
              <span className="revenue-value">₹2,34,560</span>
            </div>
            <div className="revenue-item">
              <label>Last Month</label>
              <span className="revenue-value">₹1,89,340</span>
            </div>
            <div className="revenue-item">
              <label>Growth</label>
              <span className="revenue-value">+23.8%</span>
            </div>
            <div className="revenue-item">
              <label>Projected Annual</label>
              <span className="revenue-value">₹28,14,720</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>🎯 Performance Goals</h2>
          <div className="goals-list">
            <div className="goal-item">
              <div className="goal-header">
                <span>User Acquisition</span>
                <span className="goal-progress">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Mechanic Utilization</span>
                <span className="goal-progress">88%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Service Bookings</span>
                <span className="goal-progress">92%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Customer Retention</span>
                <span className="goal-progress">85%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
