import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import '../Analytics.css';

function Analytics() {
  // Mock data for Monthly Revenue
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 50000 },
    { month: 'Mar', revenue: 48000, target: 50000 },
    { month: 'Apr', revenue: 61000, target: 55000 },
    { month: 'May', revenue: 58000, target: 55000 },
    { month: 'Jun', revenue: 72000, target: 60000 },
    { month: 'Jul', revenue: 79000, target: 65000 },
    { month: 'Aug', revenue: 85000, target: 70000 },
    { month: 'Sep', revenue: 82000, target: 75000 },
    { month: 'Oct', revenue: 88000, target: 75000 },
    { month: 'Nov', revenue: 92000, target: 80000 },
    { month: 'Dec', revenue: 105000, target: 90000 },
  ];

  // Mock data for Daily Bookings (Last 30 days)
  const dailyBookingsData = [
    { day: '1', bookings: 12, completed: 10 },
    { day: '2', bookings: 15, completed: 14 },
    { day: '3', bookings: 18, completed: 17 },
    { day: '4', bookings: 14, completed: 12 },
    { day: '5', bookings: 22, completed: 20 },
    { day: '6', bookings: 25, completed: 23 },
    { day: '7', bookings: 28, completed: 26 },
    { day: '8', bookings: 16, completed: 15 },
    { day: '9', bookings: 19, completed: 18 },
    { day: '10', bookings: 24, completed: 22 },
    { day: '11', bookings: 26, completed: 25 },
    { day: '12', bookings: 30, completed: 29 },
    { day: '13', bookings: 17, completed: 16 },
    { day: '14', bookings: 21, completed: 20 },
    { day: '15', bookings: 29, completed: 28 },
    { day: '16', bookings: 18, completed: 17 },
    { day: '17', bookings: 23, completed: 22 },
    { day: '18', bookings: 27, completed: 26 },
    { day: '19', bookings: 31, completed: 30 },
    { day: '20', bookings: 19, completed: 18 },
    { day: '21', bookings: 25, completed: 24 },
    { day: '22', bookings: 28, completed: 27 },
    { day: '23', bookings: 14, completed: 13 },
    { day: '24', bookings: 20, completed: 19 },
    { day: '25', bookings: 26, completed: 25 },
    { day: '26', bookings: 32, completed: 31 },
    { day: '27', bookings: 21, completed: 20 },
    { day: '28', bookings: 24, completed: 23 },
    { day: '29', bookings: 28, completed: 27 },
    { day: '30', bookings: 35, completed: 34 },
  ];

  // Mock data for Top Services
  const topServicesData = [
    { name: 'Oil Change', value: 2450, percentage: 22 },
    { name: 'Tire Rotation', value: 2100, percentage: 19 },
    { name: 'Battery Replacement', value: 1850, percentage: 17 },
    { name: 'Brake Service', value: 1620, percentage: 15 },
    { name: 'AC Repair', value: 1450, percentage: 13 },
    { name: 'Engine Diagnostics', value: 980, percentage: 9 },
    { name: 'Others', value: 570, percentage: 5 },
  ];

  // Mock data for Service Categories Revenue
  const serviceCategoryData = [
    { category: 'Basic Service', revenue: 145000, bookings: 450 },
    { category: 'Advanced Repair', revenue: 280000, bookings: 320 },
    { category: 'Modifications', revenue: 185000, bookings: 95 },
    { category: 'Emergency/Breakdown', revenue: 95000, bookings: 420 },
    { category: 'Custom Services', revenue: 125000, bookings: 180 },
  ];

  // Mock data for Customer Satisfaction
  const satisfactionData = [
    { rating: '5 Star', count: 450, percentage: 65 },
    { rating: '4 Star', count: 150, percentage: 22 },
    { rating: '3 Star', count: 70, percentage: 10 },
    { rating: '2 Star', count: 15, percentage: 2 },
    { rating: '1 Star', count: 5, percentage: 1 },
  ];

  // Colors for charts
  const COLORS = ['#DC2626', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#06B6D4', '#0EA5E9'];
  const CHART_COLORS = {
    primary: '#DC2626',
    secondary: '#0EA5E9',
    success: '#22C55E',
    warning: '#F97316',
  };

  // Filter state for daily bookings
  const [bookingFilter, setBookingFilter] = useState('all'); // all, completed, pending

  const renderCategoryTick = ({ x, y, payload }) => {
    const rawValue = String(payload.value || '');
    const lines = rawValue.includes('/') ? rawValue.split('/') : [rawValue];

    return (
      <text x={x} y={y} textAnchor="end" fill="#6b7280" fontSize={12}>
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  const getFilteredBookingsData = () => {
    if (bookingFilter === 'completed') {
      return dailyBookingsData.map(d => ({ day: d.day, bookings: d.completed }));
    } else if (bookingFilter === 'pending') {
      return dailyBookingsData.map(d => ({ day: d.day, bookings: d.bookings - d.completed }));
    }
    return dailyBookingsData.map(d => ({ day: d.day, bookings: d.bookings }));
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p className="header-subtitle">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="header-date">
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">₹9,27,000</p>
            <span className="metric-change positive">↑ 15.3% from last year</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Total Bookings</h3>
            <p className="metric-value">2,845</p>
            <span className="metric-change positive">↑ 12.7% this month</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Completed Services</h3>
            <p className="metric-value">2,721</p>
            <span className="metric-change positive">95.6% completion rate</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h3>Avg. Rating</h3>
            <p className="metric-value">4.62/5</p>
            <span className="metric-change positive">↑ 0.3 points</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid charts-grid-2">
        {/* Monthly Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>📈 Monthly Revenue Trend</h2>
            <p className="chart-subtitle">Revenue vs Target (Last 12 Months)</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Actual Revenue" />
              <Line type="monotone" dataKey="target" stroke={CHART_COLORS.secondary} name="Target" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Bookings Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>📅 Daily Bookings (Last 30 Days)</h2>
            <div className="chart-filter">
              <button
                className={`filter-btn ${bookingFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBookingFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${bookingFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setBookingFilter('completed')}
              >
                Completed
              </button>
              <button
                className={`filter-btn ${bookingFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setBookingFilter('pending')}
              >
                Pending
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getFilteredBookingsData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="bookings" fill={CHART_COLORS.success} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid charts-grid-2">
        {/* Top Services Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>🛠️ Top Services by Bookings</h2>
            <p className="chart-subtitle">Distribution of service requests</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={topServicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {topServicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Category Revenue */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>💵 Revenue by Service Category</h2>
            <p className="chart-subtitle">Total revenue breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={serviceCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#6b7280"
                width={140}
                tick={renderCategoryTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="revenue" fill={CHART_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-grid charts-grid-2">
        {/* Customer Satisfaction */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>⭐ Customer Satisfaction Rating</h2>
            <p className="chart-subtitle">Based on 690 customer reviews</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="rating" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill={CHART_COLORS.warning} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Bookings by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>📊 Bookings by Service Category</h2>
            <p className="chart-subtitle">Total 1,045 bookings</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={serviceCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="bookings" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="analytics-tables">
        <div className="table-card">
          <h2>🏆 Top 5 Services by Revenue</h2>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Bookings</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topServicesData.slice(0, 5).map((service, index) => (
                <tr key={index}>
                  <td>{service.name}</td>
                  <td className="table-value">{service.value.toLocaleString()}</td>
                  <td>
                    <div className="progress-bar-small">
                      <div className="progress-fill-small" style={{ width: `${service.percentage}%` }}></div>
                    </div>
                    {service.percentage}%
                  </td>
                  <td>
                    <span className="status status-active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h2>📈 Service Category Performance</h2>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Bookings</th>
                <th>Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {serviceCategoryData.map((category, index) => (
                <tr key={index}>
                  <td>{category.category}</td>
                  <td className="table-value revenue">₹{(category.revenue / 1000).toFixed(0)}K</td>
                  <td className="table-value">{category.bookings}</td>
                  <td className="table-value">₹{Math.round(category.revenue / category.bookings).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
