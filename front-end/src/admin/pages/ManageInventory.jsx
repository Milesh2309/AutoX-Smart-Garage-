import React, { useMemo, useState } from 'react';

function ManageInventory() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Engine Oil 5W-30 (4L)', sku: 'FL-ENG-530', category: 'Fluids', stock: 45, reorderLevel: 20, price: 650, supplier: 'Mobil', location: 'Aisle A1', status: 'In Stock' },
    { id: 2, name: 'Front Brake Pads - Sedan', sku: 'BRK-FRT-SED', category: 'Brakes', stock: 16, reorderLevel: 15, price: 1800, supplier: 'Brembo', location: 'Aisle B2', status: 'Low Stock' },
    { id: 3, name: 'Spark Plug (4 pack)', sku: 'IGN-SPK-4P', category: 'Ignition', stock: 8, reorderLevel: 10, price: 950, supplier: 'Bosch', location: 'Aisle C3', status: 'Low Stock' },
    { id: 4, name: 'Air Filter - SUV', sku: 'FLT-AIR-SUV', category: 'Filters', stock: 0, reorderLevel: 8, price: 720, supplier: 'Mann', location: 'Aisle D1', status: 'Out of Stock' },
    { id: 5, name: 'Coolant (1L)', sku: 'FLT-COOL-1L', category: 'Fluids', stock: 32, reorderLevel: 12, price: 420, supplier: 'Castrol', location: 'Aisle A3', status: 'In Stock' },
    { id: 6, name: 'Drive Belt - Alt', sku: 'ENG-BLT-ALT', category: 'Engine', stock: 12, reorderLevel: 6, price: 1250, supplier: 'Gates', location: 'Aisle E1', status: 'In Stock' },
    { id: 7, name: 'ECU Tuning Module', sku: 'MOD-ECU-TUNE', category: 'Modifications', stock: 6, reorderLevel: 4, price: 18500, supplier: 'RaceChip', location: 'Aisle M1', status: 'In Stock' },
    { id: 8, name: 'Performance Exhaust Kit', sku: 'MOD-EXH-PERF', category: 'Modifications', stock: 3, reorderLevel: 5, price: 24500, supplier: 'Borla', location: 'Aisle M2', status: 'Low Stock' },
    { id: 9, name: 'Coilover Suspension Kit', sku: 'MOD-SUS-COIL', category: 'Modifications', stock: 2, reorderLevel: 3, price: 38000, supplier: 'Bilstein', location: 'Aisle M3', status: 'Low Stock' },
    { id: 10, name: 'Body Kit - Aero', sku: 'MOD-BODY-AERO', category: 'Modifications', stock: 1, reorderLevel: 2, price: 52000, supplier: 'Rocket Bunny', location: 'Aisle M4', status: 'Low Stock' },
    { id: 11, name: 'Ambient Lighting Kit', sku: 'MOD-LGT-AMBI', category: 'Modifications', stock: 14, reorderLevel: 6, price: 4200, supplier: 'Philips', location: 'Aisle M5', status: 'In Stock' },
    { id: 12, name: 'Premium Audio Upgrade Pack', sku: 'MOD-AUD-PREM', category: 'Modifications', stock: 4, reorderLevel: 4, price: 26500, supplier: 'Pioneer', location: 'Aisle M6', status: 'Low Stock' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    reorderLevel: '',
    price: '',
    supplier: '',
    location: ''
  });

  const computeStatus = (stock, reorderLevel) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      stock: '',
      reorderLevel: '',
      price: '',
      supplier: '',
      location: ''
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stockValue = Number(formData.stock || 0);
    const reorderValue = Number(formData.reorderLevel || 0);
    const priceValue = Number(formData.price || 0);
    const normalizedStatus = computeStatus(stockValue, reorderValue);

    const payload = {
      ...formData,
      stock: stockValue,
      reorderLevel: reorderValue,
      price: priceValue,
      status: normalizedStatus
    };

    if (editingId) {
      setInventory((items) => items.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
    } else {
      const nextId = Math.max(...inventory.map((item) => item.id), 0) + 1;
      setInventory((items) => [...items, { id: nextId, ...payload }]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      reorderLevel: item.reorderLevel,
      price: item.price,
      supplier: item.supplier,
      location: item.location
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setInventory((items) => items.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id, status) => {
    setInventory((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categories = useMemo(() => ['All', ...new Set(inventory.map((item) => item.category))], [inventory]);

  const totalSkus = inventory.length;
  const lowStockCount = inventory.filter((item) => item.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((item) => item.status === 'Out of Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.stock) || 0), 0);
  const reorderQueue = inventory.filter((item) => item.stock <= item.reorderLevel);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📦 Spare Parts Inventory</h1>
          <p className="header-subtitle">Track stock levels, reorder points, and supplier details</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
          <form className="inventory-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Part Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="SKU / Part Code"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Category (e.g., Brakes, Fluids)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                min="0"
                placeholder="Current Stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Reorder Level"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                min="0"
                placeholder="Unit Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Rack / Bin Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update Item' : 'Add Item'}</button>
              <button type="button" className="btn-secondary" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="controls-bar">
        <div className="filter-tabs">
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} <span className="badge-count">{status === 'All' ? inventory.length : inventory.filter((item) => item.status === status).length}</span>
            </button>
          ))}
        </div>
        <div className="controls-bar" style={{ gap: '10px', justifyContent: 'flex-end' }}>
          <select
            className="search-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="bookings-container">
        {filteredInventory.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder @</th>
                <th>Price</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="header-subtitle">{item.location || 'Location pending'}</div>
                  </td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>
                    <strong>{item.stock}</strong> units
                  </td>
                  <td>{item.reorderLevel}</td>
                  <td>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                  <td>{item.supplier}</td>
                  <td>
                    <select
                      className={`status-select status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No parts found. Try a different filter or add a new item.</p>
          </div>
        )}
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total SKUs</label>
          <span>{totalSkus}</span>
        </div>
        <div className="stat-item">
          <label>Low Stock</label>
          <span>{lowStockCount}</span>
        </div>
        <div className="stat-item">
          <label>Out of Stock</label>
          <span>{outOfStockCount}</span>
        </div>
        <div className="stat-item">
          <label>Inventory Value</label>
          <span>₹{totalValue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {reorderQueue.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: '24px' }}>
          <h2>🚚 Reorder Queue</h2>
          <div className="activity-list">
            {reorderQueue.map((item) => (
              <div key={item.id} className="activity-item">
                <span className="activity-icon">⚠️</span>
                <div className="activity-info">
                  <p><strong>{item.name}</strong> is at {item.stock} units (reorder at {item.reorderLevel})</p>
                  <span className="activity-time">Supplier: {item.supplier} • SKU: {item.sku}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageInventory;
