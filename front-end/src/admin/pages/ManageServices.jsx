import React, { useState, useEffect } from 'react';
import { packagesApi } from '../../utils/apiService';

function ManageServices() {
  const [packages, setPackages] = useState([]);

  const loadPackages = async () => {
    try {
      const res = await packagesApi.listAll();
      const list = res?.data || res || [];
      setPackages(list.map((item) => ({
        ...item,
        id: item._id || item.packageId,
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        duration: item.duration || '',
        features: item.features || [],
        status: (item.status || 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
      })));
    } catch { /* keep empty */ }
  };
  useEffect(() => { loadPackages(); }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: '',
    status: 'Active',
  });

  const handleAddService = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price) || 0,
      duration: formData.duration,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      status: formData.status.toLowerCase(),
    };
    try {
      if (editingId) {
        await packagesApi.update(editingId, payload);
      } else {
        await packagesApi.create(payload);
      }
      await loadPackages();
      setEditingId(null);
    } catch { alert('Failed to save package.'); }
    setFormData({ name: '', description: '', price: '', duration: '', features: '', status: 'Active' });
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name || '',
      description: service.description || '',
      status: service.status || 'Active',
      price: String(service.price || '').replace(/[₹,]/g, ''),
      duration: service.duration || '',
      features: (service.features || []).join(', '),
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await packagesApi.delete(id);
      await loadPackages();
    } catch { alert('Failed to delete package.'); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', duration: '', features: '', status: 'Active' });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📦 Manage Packages</h1>
          <p className="header-subtitle">Create and manage service packages from one place</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Package'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Package' : 'Add New Package'}</h3>
          <form className="service-form" onSubmit={handleAddService}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Package Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Duration (e.g., 6 Months)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              required
            />
            <textarea
              placeholder="Features (comma-separated)"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows="2"
              required
            />
            <div className="form-row">
              <input
                type="number"
                min="1"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update Package' : 'Add Package'}</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="services-grid">
        {packages.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <span className="service-icon">📦</span>
              <span className={`status ${(service.status || 'active').toLowerCase()}`}>{service.status || 'Active'}</span>
            </div>
            <h3>{service.name}</h3>
            <p className="service-description">{service.description}</p>
            <div className="service-features">
              <strong>Features:</strong>
              <ul>
                {(service.features || []).slice(0, 3).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
                {(service.features || []).length > 3 && <li>+ {service.features.length - 3} more</li>}
              </ul>
            </div>
            <div className="service-price">
              <strong>Price:</strong> ₹{service.price}
            </div>
            <div className="service-price">
              <strong>Duration:</strong> {service.duration}
            </div>
            <div className="service-actions">
              <button className="btn-edit" onClick={() => handleEdit(service)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(service.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageServices;
