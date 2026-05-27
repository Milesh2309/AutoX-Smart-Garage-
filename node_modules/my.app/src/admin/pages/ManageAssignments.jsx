import React, { useState, useEffect, useMemo } from 'react';
import CommonTable from '../../components/CommonTable.jsx';
import { assignmentsApi, mechanicsApi, servicesApi } from '../../utils/apiService';

function ManageAssignments() {
  const [assignments, setAssignments] = useState([]);

  const loadAssignments = async () => {
    try {
      const res = await assignmentsApi.list();
      const raw = res?.data || res || [];
      setAssignments(raw.map((a, idx) => ({
        ...a,
        id: a._id || idx + 1,
        mechanic: a.mechanicName || a.mechanicId || '—',
        customer: a.customerName || a.customer || '—',
        vehicle: a.vehicle || '—',
        service: a.service || '—',
        job: a.notes || a.job || '—',
        startDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—',
        startTime: a.createdAt ? new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
        estimatedDuration: a.estimatedDuration || '—',
        status: a.status || 'assigned',
        progress: Array.isArray(a.progress) ? `${a.progress.length} steps` : (a.progress || '—'),
      })));
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  };

  useEffect(() => { loadAssignments(); }, []);

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

  const [mechanicsList, setMechanicsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [mechRes, svcRes] = await Promise.all([mechanicsApi.list(), servicesApi.list()]);
        setMechanicsList((mechRes?.data || mechRes || []).map(m => m.name || m.fullName || m.mechanicCode || '').filter(Boolean));
        setServicesList((svcRes?.data || svcRes || []).map(s => s.name || s.title || s.serviceName || '').filter(Boolean));
      } catch (err) {
        console.error('Error loading dropdowns:', err);
      }
    };
    loadDropdowns();
  }, []);

  const assignmentColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'mechanic', header: 'Mechanic' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'vehicle', header: 'Vehicle' },
    { accessorKey: 'service', header: 'Service' },
    { accessorKey: 'job', header: 'Job' },
    { accessorKey: 'startDate', header: 'Start Date' },
    { accessorKey: 'startTime', header: 'Start Time' },
    { accessorKey: 'estimatedDuration', header: 'Duration' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'progress', header: 'Progress' },
  ], []);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (formData.mechanic && formData.customer && formData.vehicle && formData.job) {
      try {
        await assignmentsApi.create({
          ...formData,
          progress: formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0
        });
        await loadAssignments();
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
      } catch (err) {
        console.error('Error adding assignment:', err);
      }
    }
  };

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
                {mechanicsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
              >
                <option value="">Select Service</option>
                {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
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
          {mechanicsList.map((mechanic) => {
            const stats = getMechanicStats(mechanic);
            return (
              <button
                key={mechanic}
                className={`filter-tab ${filterMechanic === mechanic ? 'active' : ''}`}
                onClick={() => setFilterMechanic(mechanic)}
              >
                {String(mechanic).split(' ')[0]} ({stats.active}/{stats.total})
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

      <div style={{ padding: '20px' }}>
        <CommonTable 
          columns={assignmentColumns} 
          data={assignments} 
          fileName="assignments-data"
          showSelection={true}
        />
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
