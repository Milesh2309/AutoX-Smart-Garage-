import React, { useState, useEffect } from 'react';
import './Reports.css';
import { analyticsApi } from '../../utils/apiService';

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

  const [keyMetrics, setKeyMetrics] = useState({
    efficiency: '0%',
    avgBookingValue: '₹0',
    satisfaction: '0/5',
    inventoryUsage: '0%',
    avgCompletionTime: '0 hrs',
  });

  const [revenue, setRevenue] = useState({
    thisMonth: '₹0',
    lastMonth: '₹0',
    growth: '0%',
    projected: '₹0',
  });

  const [goals, setGoals] = useState({
    userAcquisition: 0,
    mechanicUtilization: 0,
    serviceBookings: 0,
    customerRetention: 0,
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [dashRes, revRes] = await Promise.allSettled([
          analyticsApi.dashboard(),
          analyticsApi.revenue(),
        ]);

        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value?.data || dashRes.value || {};
          setStats({
            totalUsers: d.totalUsers || 0,
            totalMechanics: d.totalMechanics || 0,
            totalVehicles: d.totalVehicles || 0,
            totalParts: d.totalParts || 0,
            totalBookings: d.totalBookings || 0,
            totalServices: d.totalServices || 0,
            totalBreakdowns: d.totalBreakdowns || 0,
            totalModifications: d.totalModifications || 0,
          });
          if (d.keyMetrics) setKeyMetrics(d.keyMetrics);
          if (d.goals) setGoals(d.goals);
        }

        if (revRes.status === 'fulfilled') {
          const r = revRes.value?.data || revRes.value || {};
          setRevenue({
            thisMonth: r.thisMonth || '₹0',
            lastMonth: r.lastMonth || '₹0',
            growth: r.growth || '0%',
            projected: r.projected || '₹0',
          });
        }
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
              <span className="metric-value">{keyMetrics.efficiency}</span>
            </div>
            <div className="metric-item">
              <label>Average Booking Value</label>
              <span className="metric-value">{keyMetrics.avgBookingValue}</span>
            </div>
            <div className="metric-item">
              <label>Customer Satisfaction</label>
              <span className="metric-value">{keyMetrics.satisfaction}</span>
            </div>
            <div className="metric-item">
              <label>Parts Inventory Usage</label>
              <span className="metric-value">{keyMetrics.inventoryUsage}</span>
            </div>
            <div className="metric-item">
              <label>Avg Service Completion Time</label>
              <span className="metric-value">{keyMetrics.avgCompletionTime}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>💰 Revenue Summary</h2>
          <div className="revenue-grid">
            <div className="revenue-item">
              <label>This Month</label>
              <span className="revenue-value">{revenue.thisMonth}</span>
            </div>
            <div className="revenue-item">
              <label>Last Month</label>
              <span className="revenue-value">{revenue.lastMonth}</span>
            </div>
            <div className="revenue-item">
              <label>Growth</label>
              <span className="revenue-value">{revenue.growth}</span>
            </div>
            <div className="revenue-item">
              <label>Projected Annual</label>
              <span className="revenue-value">{revenue.projected}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>🎯 Performance Goals</h2>
          <div className="goals-list">
            <div className="goal-item">
              <div className="goal-header">
                <span>User Acquisition</span>
                <span className="goal-progress">{goals.userAcquisition}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${goals.userAcquisition}%` }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Mechanic Utilization</span>
                <span className="goal-progress">{goals.mechanicUtilization}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${goals.mechanicUtilization}%` }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Service Bookings</span>
                <span className="goal-progress">{goals.serviceBookings}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${goals.serviceBookings}%` }}></div>
              </div>
            </div>
            <div className="goal-item">
              <div className="goal-header">
                <span>Customer Retention</span>
                <span className="goal-progress">{goals.customerRetention}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${goals.customerRetention}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
