import React, { useState, useMemo } from 'react';
import CommonTable from '../../components/CommonTable.jsx';

function ManageModifications() {
  const [modifications, setModifications] = useState([
    { 
      id: 1, 
      customer: 'Raj Patel', 
      vehicle: 'Honda Civic (MH-04-AB-1234)', 
      modType: 'Performance Tuning',
      description: 'ECU remapping, sports exhaust, air intake upgrade',
      estimatedCost: '₹45,000',
      duration: '3-4 days',
      phone: '9876543210',
      status: 'In Progress',
      assignedTo: 'Suresh Patel',
      date: '2025-12-28',
      progress: 60
    },
    { 
      id: 2, 
      customer: 'Neha Sharma', 
      vehicle: 'Maruti Swift (DL-01-CD-5678)', 
      modType: 'Body Kit Installation',
      description: 'Front & rear bumper upgrade, side skirts, spoiler installation',
      estimatedCost: '₹35,000',
      duration: '2-3 days',
      phone: '9876543211',
      status: 'Pending',
      assignedTo: 'Rajesh Kumar',
      date: '2025-12-29',
      progress: 0
    },
    { 
      id: 3, 
      customer: 'Vikram Singh', 
      vehicle: 'Toyota Fortuner (GJ-05-EF-9012)', 
      modType: 'Suspension Upgrade',
      description: 'Lift kit installation, heavy-duty shocks, off-road springs',
      estimatedCost: '₹75,000',
      duration: '4-5 days',
      phone: '9876543212',
      status: 'In Progress',
      assignedTo: 'Ramesh Gupta',
      date: '2025-12-27',
      progress: 40
    },
    { 
      id: 4, 
      customer: 'Priya Gupta', 
      vehicle: 'Hyundai Creta (MH-02-GH-3456)', 
      modType: 'Interior Customization',
      description: 'Leather seat covers, ambient lighting, custom dashboard',
      estimatedCost: '₹28,000',
      duration: '2 days',
      phone: '9876543213',
      status: 'Completed',
      assignedTo: 'Ashok Sharma',
      date: '2025-12-25',
      progress: 100
    },
    { 
      id: 5, 
      customer: 'Amit Desai', 
      vehicle: 'Skoda Rapid (GJ-06-IJ-7890)', 
      modType: 'Audio System Upgrade',
      description: 'Premium speakers, subwoofer, amplifier, sound deadening',
      estimatedCost: '₹55,000',
      duration: '2-3 days',
      phone: '9876543214',
      status: 'Completed',
      assignedTo: 'Vikram Singh',
      date: '2025-12-26',
      progress: 100
    },
    { 
      id: 6, 
      customer: 'Rohan Kumar', 
      vehicle: 'Tata Nexon (DL-03-KL-1234)', 
      modType: 'Lighting Modifications',
      description: 'LED headlights, fog lamps, underglow lighting kit',
      estimatedCost: '₹22,000',
      duration: '1-2 days',
      phone: '9876543215',
      status: 'Pending',
      assignedTo: 'Deepak Verma',
      date: '2025-12-30',
      progress: 0
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    vehicle: '',
    modType: '',
    description: '',
    estimatedCost: '',
    duration: '',
    phone: '',
    status: 'Pending',
    assignedTo: ''
  });

  const modificationColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'vehicle', header: 'Vehicle' },
    { accessorKey: 'modType', header: 'Modification Type' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'estimatedCost', header: 'Est. Cost' },
    { accessorKey: 'duration', header: 'Duration' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'assignedTo', header: 'Assigned To' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'progress', header: 'Progress' },
  ], []);

  const modificationTypes = [
    'Performance Tuning',
    'Body Kit Installation',
    'Suspension Upgrade',
    'Interior Customization',
    'Audio System Upgrade',
    'Lighting Modifications',
    'Exhaust System',
    'Wheel & Tire Upgrade',
    'Paint & Wrap',
    'Engine Modification'
  ];

  const mechanics = ['Suresh Patel', 'Rajesh Kumar', 'Ramesh Gupta', 'Vikram Singh', 'Ashok Sharma', 'Deepak Verma'];

  const handleAddModification = (e) => {
    e.preventDefault();
    if (formData.customer && formData.vehicle && formData.modType) {
      const newModification = {
        id: Math.max(...modifications.map(m => m.id), 0) + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        progress: formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0
      };
      setModifications([...modifications, newModification]);
      setFormData({
        customer: '',
        vehicle: '',
        modType: '',
        description: '',
        estimatedCost: '',
        duration: '',
        phone: '',
        status: 'Pending',
        assignedTo: ''
      });
      setShowForm(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setModifications(modifications.map(m => 
      m.id === id ? { 
        ...m, 
        status: newStatus,
        progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0
      } : m
    ));
  };

  const handleDelete = (id) => {
    setModifications(modifications.filter(m => m.id !== id));
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      customer: '',
      vehicle: '',
      modType: '',
      description: '',
      estimatedCost: '',
      duration: '',
      phone: '',
      status: 'Pending',
      assignedTo: ''
    });
  };

  const filteredModifications = modifications.filter(m => {
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchesSearch = m.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.modType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return modifications.length;
    return modifications.filter(m => m.status === status).length;
  };

  const totalRevenue = modifications
    .filter(m => m.status === 'Completed')
    .reduce((sum, m) => sum + (parseInt(m.estimatedCost?.replace(/[₹,+]/g, '')) || 0), 0);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>⚙️ Vehicle Modifications</h1>
          <p className="header-subtitle">Manage custom vehicle modifications & upgrades</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Modification'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Modification Request</h3>
          <form className="modification-form" onSubmit={handleAddModification}>
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
              <select
                value={formData.modType}
                onChange={(e) => setFormData({ ...formData, modType: e.target.value })}
                required
              >
                <option value="">Select Modification Type</option>
                {modificationTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <textarea
              placeholder="Modification Description / Details"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              required
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Estimated Cost (e.g., ₹50,000)"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              />
              <input
                type="text"
                placeholder="Duration (e.g., 3-4 days)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div className="form-row">
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Assign to Mechanic</option>
                {mechanics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
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
              <button type="submit" className="btn-primary">Add Modification</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="controls-bar">
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

        <input
          type="text"
          placeholder="Search by customer, vehicle, or modification type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="bookings-container">
        <CommonTable 
          columns={modificationColumns}
          data={filteredModifications}
          filename="modifications"
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Modifications</label>
          <span>{modifications.length}</span>
        </div>
        <div className="stat-item">
          <label>In Progress</label>
          <span>{modifications.filter(m => m.status === 'In Progress').length}</span>
        </div>
        <div className="stat-item">
          <label>Completed</label>
          <span>{modifications.filter(m => m.status === 'Completed').length}</span>
        </div>
        <div className="stat-item">
          <label>Total Revenue</label>
          <span>₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageModifications;
