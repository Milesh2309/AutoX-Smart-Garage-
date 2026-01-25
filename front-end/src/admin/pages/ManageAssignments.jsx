import React, { useState } from 'react';

function ManageAssignments() {
  const [assignments, setAssignments] = useState([
    { 
      id: 1, 
      mechanic: 'Suresh Patel', 
      customer: 'John Doe',
      vehicle: 'Honda Civic (MH-04-AB-1234)',
      service: 'Smart Garage Services',
      job: 'Full vehicle inspection & Oil change',
      startDate: '2025-12-30',
      startTime: '10:00 AM',
      estimatedDuration: '2 hours',
      status: 'In Progress',
      progress: 60,
      phone: '9876543210'
    },
    { 
      id: 2, 
      mechanic: 'Rajesh Kumar', 
      customer: 'Sarah Smith',
      vehicle: 'Maruti Swift (DL-01-CD-5678)',
      service: 'Car & Bike Repair',
      job: 'AC repair & servicing',
      startDate: '2025-12-30',
      startTime: '11:30 AM',
      estimatedDuration: '3 hours',
      status: 'In Progress',
      progress: 45,
      phone: '9876543211'
    },
    { 
      id: 3, 
      mechanic: 'Ramesh Gupta', 
      customer: 'Mike Johnson',
      vehicle: 'Toyota Fortuner (GJ-05-EF-9012)',
      service: 'Emergency Roadside Help',
      job: 'Engine failure diagnosis & repair',
      startDate: '2025-12-30',
      startTime: '2:00 PM',
      estimatedDuration: '4 hours',
      status: 'In Progress',
      progress: 30,
      phone: '9876543212'
    },
    { 
      id: 4, 
      mechanic: 'Ashok Sharma', 
      customer: 'Priya Gupta',
      vehicle: 'Hyundai Creta (MH-02-GH-3456)',
      service: 'Vehicle Detailing',
      job: 'Interior deep cleaning & polishing',
      startDate: '2025-12-29',
      startTime: '10:00 AM',
      estimatedDuration: '3 hours',
      status: 'Completed',
      progress: 100,
      phone: '9876543213'
    },
    { 
      id: 5, 
      mechanic: 'Vikram Singh', 
      customer: 'Raj Patel',
      vehicle: 'Skoda Rapid (GJ-06-IJ-7890)',
      service: 'Tire & Wheel Services',
      job: 'Wheel alignment & balancing',
      startDate: '2025-12-29',
      startTime: '2:30 PM',
      estimatedDuration: '2 hours',
      status: 'Completed',
      progress: 100,
      phone: '9876543214'
    },
    { 
      id: 6, 
      mechanic: 'Deepak Verma', 
      customer: 'Asha Kumar',
      vehicle: 'Tata Nexon (DL-03-KL-1234)',
      service: 'Pre-Purchase Inspection',
      job: 'Complete vehicle assessment & report',
      startDate: '2025-12-28',
      startTime: '11:00 AM',
      estimatedDuration: '2 hours',
      status: 'Completed',
      progress: 100,
      phone: '9876543215'
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMechanic, setFilterMechanic] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mechanic: '',
    customer: '',
    vehicle: '',
    service: '',
    job: '',
    estimatedDuration: '',
    phone: '',
    status: 'Pending'
  });

  const mechanics = ['Suresh Patel', 'Rajesh Kumar', 'Ramesh Gupta', 'Vikram Singh', 'Ashok Sharma', 'Deepak Verma'];
  const services = ['Smart Garage Services', 'Car & Bike Repair', 'Emergency Roadside Help', 'Vehicle Detailing', 'Pre-Purchase Inspection', 'Tire & Wheel Services', 'Vehicle Modification', 'Vehicle Breakdown Assistance'];

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (formData.mechanic && formData.customer && formData.vehicle && formData.job) {
      const newAssignment = {
        id: Math.max(...assignments.map(a => a.id), 0) + 1,
        ...formData,
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        progress: formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0
      };
      setAssignments([...assignments, newAssignment]);
      setFormData({
        mechanic: '',
        customer: '',
        vehicle: '',
        service: '',
        job: '',
        estimatedDuration: '',
        phone: '',
        status: 'Pending'
      });
      setShowForm(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { 
        ...a, 
        status: newStatus,
        progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0
      } : a
    ));
  };

  const handleDelete = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchesMechanic = filterMechanic === 'All' || a.mechanic === filterMechanic;
    const matchesSearch = a.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.job.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesMechanic && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return assignments.length;
    return assignments.filter(a => a.status === status).length;
  };

  const getMechanicStats = (mechanicName) => {
    const mechanicJobs = assignments.filter(a => a.mechanic === mechanicName);
    return {
      total: mechanicJobs.length,
      active: mechanicJobs.filter(a => a.status === 'In Progress').length,
      completed: mechanicJobs.filter(a => a.status === 'Completed').length
    };
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📋 Job Assignments</h1>
          <p className="header-subtitle">Track mechanic jobs & vehicle assignments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Assign Job'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Assign New Job to Mechanic</h3>
          <form className="assignment-form" onSubmit={handleAddAssignment}>
            <div className="form-row">
              <select
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                required
              >
                <option value="">Select Mechanic</option>
                {mechanics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
              >
                <option value="">Select Service</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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
                placeholder="Vehicle (Model & Registration)"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Estimated Duration (e.g., 2 hours)"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Job Description / Work to be done"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              rows="2"
              required
            />
            <div className="form-row">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Assign Job</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-tabs">
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status} <span className="badge-count">{getStatusCount(status)}</span>
            </button>
          ))}
        </div>
        <div className="filter-tabs" style={{ marginTop: '12px' }}>
          <button
            className={`filter-tab ${filterMechanic === 'All' ? 'active' : ''}`}
            onClick={() => setFilterMechanic('All')}
          >
            All Mechanics
          </button>
          {mechanics.map((mechanic) => {
            const stats = getMechanicStats(mechanic);
            return (
              <button
                key={mechanic}
                className={`filter-tab ${filterMechanic === mechanic ? 'active' : ''}`}
                onClick={() => setFilterMechanic(mechanic)}
              >
                {mechanic.split(' ')[0]} ({stats.active}/{stats.total})
              </button>
            );
          })}
        </div>
      </div>

      <div className="controls-bar" style={{ marginTop: '16px' }}>
        <input
          type="text"
          placeholder="Search by customer, vehicle, or job..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="bookings-container">
        {filteredAssignments.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mechanic</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Vehicle Number</th>
                <th>Service / Job</th>
                <th>Start Date & Time</th>
                <th>Duration</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td><strong>{assignment.mechanic}</strong></td>
                  <td>
                    <div>
                      <strong>{assignment.customer}</strong><br/>
                      <small style={{ color: '#999' }}>{assignment.phone}</small>
                    </div>
                  </td>
                  <td><strong>{assignment.vehicle.split('(')[0].trim()}</strong></td>
                  <td><strong>{assignment.vehicle.includes('(') ? assignment.vehicle.split('(')[1].replace(')', '') : '-'}</strong></td>
                  <td>
                    <div>
                      <strong>{assignment.service}</strong><br/>
                      <small style={{ color: '#666' }}>{assignment.job}</small>
                    </div>
                  </td>
                  <td>{assignment.startDate}<br/>{assignment.startTime}</td>
                  <td>{assignment.estimatedDuration}</td>
                  <td>
                    <div className="progress-small">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{width: `${assignment.progress}%`}}
                        ></div>
                      </div>
                      <span style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {assignment.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`status-select status-${assignment.status.toLowerCase().replace(' ', '-')}`}
                      value={assignment.status}
                      onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(assignment.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No assignments found</p>
          </div>
        )}
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Assignments</label>
          <span>{assignments.length}</span>
        </div>
        <div className="stat-item">
          <label>In Progress</label>
          <span>{assignments.filter(a => a.status === 'In Progress').length}</span>
        </div>
        <div className="stat-item">
          <label>Pending</label>
          <span>{assignments.filter(a => a.status === 'Pending').length}</span>
        </div>
        <div className="stat-item">
          <label>Completed Today</label>
          <span>{assignments.filter(a => a.status === 'Completed').length}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageAssignments;
