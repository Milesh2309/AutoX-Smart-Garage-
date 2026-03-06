import React, { useMemo, useState, useEffect } from 'react';
import CommonTable from '../../components/CommonTable.jsx';
import { inventoryApi } from '../../utils/apiService';

function ManageInventory() {
  const [inventory, setInventory] = useState([]);

  const loadInventory = async () => {
    try {
      const res = await inventoryApi.list();
      const raw = res?.data || res || [];
      setInventory(raw.map(item => {
        const stock = Number(item.stock) || 0;
        const reorderLevel = Number(item.minStock || item.reorderLevel) || 0;
        return {
          ...item,
          id: item.sku || item._id || '',
          stock,
          reorderLevel,
          price: item.price || 0,
          supplier: item.supplier || '—',
          location: item.location || '—',
          status: stock <= 0 ? 'Out of Stock' : stock <= reorderLevel ? 'Low Stock' : 'In Stock',
        };
      }));
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  };

  useEffect(() => { loadInventory(); }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stockValue = Number(formData.stock || 0);
    const reorderValue = Number(formData.reorderLevel || 0);
    const priceValue = Number(formData.price || 0);
    const normalizedStatus = computeStatus(stockValue, reorderValue);

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      stock: stockValue,
      minStock: reorderValue,
      price: priceValue,
      supplier: formData.supplier,
      location: formData.location,
      active: true,
    };

    try {
      if (editingId) {
        await inventoryApi.update(editingId, payload);
      } else {
        await inventoryApi.create(payload);
      }
      await loadInventory();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const categories = useMemo(() => ['All', ...new Set(inventory.map((item) => item.category))], [inventory]);

  const filteredInventory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesSearch =
        normalizedSearch === '' ||
        (item.name || '').toLowerCase().includes(normalizedSearch) ||
        (item.sku || '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [inventory, statusFilter, categoryFilter, searchTerm]);

  const inventoryColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Part Name' },
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'reorderLevel', header: 'Reorder Level' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'supplier', header: 'Supplier' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'status', header: 'Status' },
  ], []);

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

      <div style={{ padding: '20px' }}>
        <CommonTable 
          columns={inventoryColumns} 
          data={filteredInventory} 
          fileName="inventory-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total SKUs</label>
          <span>{inventory.length}</span>
        </div>
        <div className="stat-item">
          <label>Low Stock</label>
          <span>{inventory.filter((item) => item.status === 'Low Stock').length}</span>
        </div>
        <div className="stat-item">
          <label>Out of Stock</label>
          <span>{inventory.filter((item) => item.status === 'Out of Stock').length}</span>
        </div>
        <div className="stat-item">
          <label>Inventory Value</label>
          <span>₹{inventory.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.stock) || 0), 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {inventory.filter((item) => item.stock <= item.reorderLevel).length > 0 && (
        <div className="dashboard-section" style={{ marginTop: '24px' }}>
          <h2>🚚 Reorder Queue</h2>
          <div className="activity-list">
            {inventory.filter((item) => item.stock <= item.reorderLevel).map((item) => (
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
