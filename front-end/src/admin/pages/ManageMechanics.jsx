import React, { useState, useMemo } from 'react';
import CommonTable from '../../components/CommonTable.jsx';

function ManageMechanics() {
  const [mechanics, setMechanics] = useState([
    { id: 1, name: 'Suresh Patel', expertise: 'Engine & Transmission', phone: '9876543250', experience: '8 years', status: 'Available', assignedJobs: 5, rating: 4.8 },
    { id: 2, name: 'Rajesh Kumar', expertise: 'Electrical & AC', phone: '9876543251', experience: '6 years', status: 'Available', assignedJobs: 3, rating: 4.6 },
    { id: 3, name: 'Ramesh Gupta', expertise: 'Suspension & Brakes', phone: '9876543252', experience: '10 years', status: 'Busy', assignedJobs: 7, rating: 4.9 },
    { id: 4, name: 'Vikram Singh', expertise: 'General Maintenance', phone: '9876543253', experience: '5 years', status: 'Available', assignedJobs: 2, rating: 4.5 },
    { id: 5, name: 'Ashok Sharma', expertise: 'Painting & Denting', phone: '9876543254', experience: '7 years', status: 'Available', assignedJobs: 4, rating: 4.7 },
    { id: 6, name: 'Deepak Verma', expertise: 'Tire & Wheel Services', phone: '9876543255', experience: '4 years', status: 'Busy', assignedJobs: 6, rating: 4.4 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    expertise: '',
    phone: '',
    experience: '',
    status: 'Available',
    rating: ''
  });

  const handleAddMechanic = (e) => {
    e.preventDefault();
    if (formData.name && formData.expertise && formData.phone) {
      if (editingId) {
        setMechanics(mechanics.map(m => m.id === editingId ? { ...m, ...formData, assignedJobs: m.assignedJobs } : m));
        setEditingId(null);
      } else {
        const newMechanic = {
          id: Math.max(...mechanics.map(m => m.id), 0) + 1,
          ...formData,
          assignedJobs: 0,
          rating: formData.rating || '4.5'
        };
        setMechanics([...mechanics, newMechanic]);
      }
      setFormData({
        name: '',
        expertise: '',
        phone: '',
        experience: '',
        status: 'Available',
        rating: ''
      });
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      expertise: '',
      phone: '',
      experience: '',
      status: 'Available',
      rating: ''
    });
  };

  const mechanicColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'expertise', header: 'Expertise' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'experience', header: 'Experience' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'assignedJobs', header: 'Assigned Jobs' },
    { accessorKey: 'rating', header: 'Rating' },
  ], []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🔧 Manage Mechanics</h1>
          <p className="header-subtitle">Total Mechanics: {mechanics.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Mechanic'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Mechanic' : 'Add New Mechanic'}</h3>
          <form className="mechanic-form" onSubmit={handleAddMechanic}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Mechanic Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                placeholder="Expertise (e.g., Engine & Transmission)"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Experience (e.g., 5 years)"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                placeholder="Rating (1-5)"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Off">Off</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update Mechanic' : 'Add Mechanic'}</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        <CommonTable 
          columns={mechanicColumns} 
          data={mechanics} 
          fileName="mechanics-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Mechanics</label>
          <span>{mechanics.length}</span>
        </div>
        <div className="stat-item">
          <label>Available Now</label>
          <span>{mechanics.filter(m => m.status === 'Available').length}</span>
        </div>
        <div className="stat-item">
          <label>Average Rating</label>
          <span>⭐ {(mechanics.reduce((sum, m) => sum + parseFloat(m.rating), 0) / mechanics.length).toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <label>Total Assigned Jobs</label>
          <span>{mechanics.reduce((sum, m) => sum + m.assignedJobs, 0)}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageMechanics;
