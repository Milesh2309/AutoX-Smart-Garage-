import React, { useState } from 'react';

function ManageBreakdown() {
  const [breakdowns, setBreakdowns] = useState([
    { id: 1, customer: 'Vikram Singh', location: 'Highway NH-8, Ahmedabad', vehicle: 'Honda Civic', vehicleNumber: 'MH-04-AB-1234', issue: 'Engine Failure', phone: '9876543220', date: '2025-12-30', time: '2:15 PM', status: 'Reached', mechanic: 'Suresh Patel', amount: '₹1,500' },
    { id: 2, customer: 'Neha Sharma', location: 'Airport Road, Ahmedabad', vehicle: 'Maruti Swift', vehicleNumber: 'DL-01-CD-5678', issue: 'Flat Tire', phone: '9876543221', date: '2025-12-29', time: '11:30 AM', status: 'Completed', mechanic: 'Rajesh Kumar', amount: '₹500' },
    { id: 3, customer: 'Amit Patel', location: 'SG Highway, Ahmedabad', vehicle: 'Toyota Fortuner', vehicleNumber: 'GJ-05-EF-9012', issue: 'Battery Dead', phone: '9876543222', date: '2025-12-28', time: '9:20 PM', status: 'Completed', mechanic: 'Suresh Patel', amount: '₹800' },
    { id: 4, customer: 'Pooja Singh', location: 'Ring Road, Ahmedabad', vehicle: 'Hyundai Creta', vehicleNumber: 'MH-02-GH-3456', issue: 'Fuel Pump Issue', phone: '9876543223', date: '2025-12-27', time: '4:45 PM', status: 'Reached', mechanic: 'Ramesh Gupta', amount: '₹2,000' },
    { id: 5, customer: 'Rohan Desai', location: 'Thaltej, Ahmedabad', vehicle: 'Skoda Rapid', vehicleNumber: 'GJ-06-IJ-7890', issue: 'Overheating', phone: '9876543224', date: '2025-12-26', time: '3:10 PM', status: 'Completed', mechanic: 'Rajesh Kumar', amount: '₹3,500' },
    { id: 6, customer: 'Anjali Verma', location: 'Iscon, Ahmedabad', vehicle: 'Tata Nexon', vehicleNumber: 'DL-03-KL-1234', issue: 'Brake Failure', phone: '9876543225', date: '2025-12-25', time: '10:00 AM', status: 'En Route', mechanic: 'Suresh Patel', amount: '₹2,500' },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    location: '',
    vehicle: '',
    issue: '',
    phone: '',
    status: 'Pending',
    mechanic: '',
    amount: ''
  });

  const handleAddBreakdown = (e) => {
    e.preventDefault();
    if (formData.customer && formData.location && formData.vehicle && formData.issue) {
      const newBreakdown = {
        id: Math.max(...breakdowns.map(b => b.id), 0) + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
      setBreakdowns([...breakdowns, newBreakdown]);
      setFormData({
        customer: '',
        location: '',
        vehicle: '',
        issue: '',
        phone: '',
        status: 'Pending',
        mechanic: '',
        amount: ''
      });
      setShowForm(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setBreakdowns(breakdowns.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleDelete = (id) => {
    setBreakdowns(breakdowns.filter(b => b.id !== id));
  };

  const filteredBreakdowns = breakdowns.filter(b => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.issue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return breakdowns.length;
    return breakdowns.filter(b => b.status === status).length;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🚘 Manage Breakdowns</h1>
          <p className="header-subtitle">Total Requests: {breakdowns.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Breakdown'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Breakdown Request</h3>
          <form className="breakdown-form" onSubmit={handleAddBreakdown}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Vehicle Model"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Issue/Problem"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="Location/Address"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              rows="2"
              required
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Assigned Mechanic"
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
              />
              <input
                type="text"
                placeholder="Service Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="En Route">En Route</option>
                <option value="Reached">Reached</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Request</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="controls-bar">
        <div className="filter-tabs">
          {['All', 'Pending', 'En Route', 'Reached', 'Completed'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status} <span className="badge-count">{getStatusCount(status)}</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by customer, issue, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="bookings-container">
        {filteredBreakdowns.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Location</th>
                <th>Vehicle</th>
                <th>Vehicle Number</th>
                <th>Issue</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Mechanic</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreakdowns.map((breakdown) => (
                <tr key={breakdown.id}>
                  <td><strong>{breakdown.customer}</strong></td>
                  <td>{breakdown.location}</td>
                  <td>{breakdown.vehicle}</td>
                  <td><strong>{breakdown.vehicleNumber}</strong></td>
                  <td>{breakdown.issue}</td>
                  <td><a href={`tel:${breakdown.phone}`}>{breakdown.phone}</a></td>
                  <td>{breakdown.date} @ {breakdown.time}</td>
                  <td>{breakdown.mechanic || '-'}</td>
                  <td><strong>{breakdown.amount || '-'}</strong></td>
                  <td>
                    <select
                      className={`status-select status-${breakdown.status.toLowerCase().replace(' ', '-')}`}
                      value={breakdown.status}
                      onChange={(e) => handleStatusChange(breakdown.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="En Route">En Route</option>
                      <option value="Reached">Reached</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(breakdown.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No breakdown requests found</p>
          </div>
        )}
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Requests</label>
          <span>{breakdowns.length}</span>
        </div>
        <div className="stat-item">
          <label>Completed Today</label>
          <span>{breakdowns.filter(b => b.status === 'Completed').length}</span>
        </div>
        <div className="stat-item">
          <label>Pending Requests</label>
          <span>{breakdowns.filter(b => b.status === 'Pending').length}</span>
        </div>
        <div className="stat-item">
          <label>Total Revenue</label>
          <span>₹{breakdowns.reduce((sum, b) => sum + (parseInt(b.amount?.replace(/[₹,]/g, '')) || 0), 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageBreakdown;
