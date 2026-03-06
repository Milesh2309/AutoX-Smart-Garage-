import React, { useState, useEffect } from 'react';
import { servicesApi } from '../../utils/apiService';

function ManageServices() {
  const [services, setServices] = useState([]);

  const loadServices = async () => {
    try {
      const res = await servicesApi.list();
      const list = res?.data || res || [];
      setServices(list.map(s => ({
        ...s,
        id: s._id || s.id,
        title: s.name || s.title || '',
        price: s.basePrice != null ? `₹${s.basePrice}` : (s.price || ''),
        rawPrice: s.basePrice || s.price || '',
        status: s.active === false ? 'Inactive' : (s.status || 'Active'),
        icon: s.icon || '🔧',
        features: s.features || [],
        category: s.category || '',
        duration: s.estimatedDurationMinutes ? `${s.estimatedDurationMinutes} min` : '',
      })));
    } catch { /* keep empty */ }
  };
  useEffect(() => { loadServices(); }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', icon: '', description: '', status: 'Active', price: '', features: '' });

  const handleAddService = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.title,
      description: formData.description,
      basePrice: Number(formData.price) || 0,
      active: formData.status === 'Active',
      icon: formData.icon,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await servicesApi.update(editingId, payload);
      } else {
        await servicesApi.create(payload);
      }
      await loadServices();
      setEditingId(null);
    } catch { alert('Failed to save service.'); }
    setFormData({ title: '', icon: '', description: '', status: 'Active', price: '', features: '' });
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      title: service.title || '',
      icon: service.icon || '',
      description: service.description || '',
      status: service.status || 'Active',
      price: String(service.rawPrice || service.basePrice || service.price || '').replace(/[₹,]/g, ''),
      features: (service.features || []).join(', ')
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await servicesApi.delete(id);
      await loadServices();
    } catch { alert('Failed to delete service.'); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', icon: '', description: '', status: 'Active', price: '', features: '' });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🚗 Manage Services</h1>
          <p className="header-subtitle">Manage all automotive services offered by AutoX</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
          <form className="service-form" onSubmit={handleAddService}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Service Icon (e.g., 🚗)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength="2"
              />
              <input
                type="text"
                placeholder="Service Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="Service Description"
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
                type="text"
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
              <button type="submit" className="btn-primary">{editingId ? 'Update Service' : 'Add Service'}</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <span className="service-icon">{service.icon}</span>
              <span className={`status ${(service.status || 'active').toLowerCase()}`}>{service.status || 'Active'}</span>
            </div>
            <h3>{service.title || service.name}</h3>
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
              <strong>Price:</strong> {service.price}
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
