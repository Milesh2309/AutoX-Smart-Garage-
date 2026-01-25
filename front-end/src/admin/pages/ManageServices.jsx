import React, { useState } from 'react';

function ManageServices() {
  const [services, setServices] = useState([
    {
      id: 1,
      title: 'Smart Garage Services',
      icon: '🚗',
      description: 'Complete vehicle diagnostics, maintenance, and scheduled servicing by certified technicians.',
      features: ['Full vehicle inspection', 'Oil change & filter replacement', 'Brake system check', 'Battery health check', 'Tire rotation & alignment'],
      status: 'Active',
      price: '₹2,499'
    },
    {
      id: 2,
      title: 'Vehicle Breakdown Assistance',
      icon: '🛠',
      description: '24/7 roadside support for breakdowns, tire changes, fuel delivery, and quick fixes.',
      features: ['24/7 Emergency support', 'On-spot tire change', 'Battery jump-start', 'Fuel delivery service', 'Towing assistance'],
      status: 'Active',
      price: 'Call for quote'
    },
    {
      id: 3,
      title: 'Vehicle Modification',
      icon: '⚙',
      description: 'Expert custom modifications, upgrades, and tuning to enhance performance and aesthetics.',
      features: ['Performance tuning', 'Custom body kits', 'Exhaust upgrades', 'Lighting modifications', 'Interior customization'],
      status: 'Active',
      price: '₹5,000+'
    },
    {
      id: 4,
      title: 'Car & Bike Repair',
      icon: '🔧',
      description: 'Comprehensive repair services for all vehicle types with genuine parts and warranty.',
      features: ['Engine repair & overhaul', 'Transmission services', 'AC repair & service', 'Electrical diagnostics', 'Body repair & painting'],
      status: 'Active',
      price: 'Variable'
    },
    {
      id: 5,
      title: 'Emergency Roadside Help',
      icon: '🚘',
      description: 'Immediate assistance for accidents, mechanical failures, and emergency towing services.',
      features: ['Instant emergency response', 'Accident support', 'Emergency towing', 'Lockout assistance', 'Flat tire replacement'],
      status: 'Active',
      price: '24/7'
    },
    {
      id: 6,
      title: 'Vehicle Detailing',
      icon: '✨',
      description: 'Professional cleaning, polishing, and detailing to make your vehicle look brand new.',
      features: ['Interior deep cleaning', 'Exterior polishing & wax', 'Paint protection coating', 'Ceramic coating', 'Odor removal treatment'],
      status: 'Active',
      price: '₹3,999'
    },
    {
      id: 7,
      title: 'Pre-Purchase Inspection',
      icon: '🔍',
      description: 'Detailed inspection report before buying a used vehicle to ensure quality and safety.',
      features: ['Complete vehicle assessment', 'Mechanical inspection', 'Body & paint check', 'Documentation verification', 'Test drive evaluation'],
      status: 'Active',
      price: '₹2,499'
    },
    {
      id: 8,
      title: 'Tire & Wheel Services',
      icon: '⚪',
      description: 'Complete tire solutions including replacement, alignment, balancing, and wheel care.',
      features: ['Tire replacement', 'Wheel alignment', 'Wheel balancing', 'Puncture repair', 'Tire rotation'],
      status: 'Active',
      price: '₹499+'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', icon: '', description: '', status: 'Active', price: '', features: '' });

  const handleAddService = (e) => {
    e.preventDefault();
    if (editingId) {
      setServices(services.map(s => s.id === editingId ? { ...s, ...formData, features: formData.features.split(',').map(f => f.trim()) } : s));
      setEditingId(null);
    } else {
      const newService = {
        id: Math.max(...services.map(s => s.id), 0) + 1,
        ...formData,
        features: formData.features.split(',').map(f => f.trim())
      };
      setServices([...services, newService]);
    }
    setFormData({ title: '', icon: '', description: '', status: 'Active', price: '', features: '' });
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      title: service.title,
      icon: service.icon,
      description: service.description,
      status: service.status,
      price: service.price,
      features: service.features.join(', ')
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setServices(services.filter(s => s.id !== id));
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
              <span className={`status ${service.status.toLowerCase()}`}>{service.status}</span>
            </div>
            <h3>{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <div className="service-features">
              <strong>Features:</strong>
              <ul>
                {service.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
                {service.features.length > 3 && <li>+ {service.features.length - 3} more</li>}
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
