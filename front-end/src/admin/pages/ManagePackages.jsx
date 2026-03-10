import React, { useMemo, useState, useEffect } from 'react';
import CommonTable from '../../components/CommonTable.jsx';
import { packagesApi } from '../../utils/apiService';

function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPackages = async () => {
    try {
      const res = await packagesApi.listAll();
      const raw = res?.data || res || [];
      setPackages(raw.map(item => ({
        id: item.packageId || item._id || '',
        userId: item.userId || 'N/A',
        name: item.name || 'N/A',
        price: item.price || 'N/A',
        validity: item.validity || 'N/A',
        totalServices: item.totalServices || 0,
        servicesUsed: item.servicesUsed || 0,
        nextDue: item.nextDue || '—',
        status: item.status || 'N/A',
        subscribedAt: item.subscribedAt ? new Date(item.subscribedAt).toLocaleDateString('en-IN') : 'N/A',
      })));
    } catch (err) {
      console.error('Error loading packages:', err);
    }
  };

  useEffect(() => { loadPackages(); }, []);

  const filteredPackages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return packages.filter(item => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch = !search ||
        item.name.toLowerCase().includes(search) ||
        String(item.userId).includes(search) ||
        item.id.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [packages, statusFilter, searchTerm]);

  const packageColumns = useMemo(() => [
    { accessorKey: 'id', header: 'Package ID' },
    { accessorKey: 'userId', header: 'User ID' },
    { accessorKey: 'name', header: 'Package Name' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'validity', header: 'Validity' },
    { accessorKey: 'totalServices', header: 'Total Services' },
    { accessorKey: 'servicesUsed', header: 'Used' },
    { accessorKey: 'nextDue', header: 'Next Due' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'subscribedAt', header: 'Subscribed On' },
  ], []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📦 Manage Packages</h1>
          <p className="header-subtitle">Total Subscriptions: {packages.length}</p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="filter-tabs">
          {['All', 'Active', 'expired', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}{' '}
              <span className="badge-count">
                {status === 'All' ? packages.length : packages.filter(p => p.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, user ID or package ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div style={{ padding: '20px' }}>
        <CommonTable
          columns={packageColumns}
          data={filteredPackages}
          fileName="packages-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Packages</label>
          <span>{packages.length}</span>
        </div>
        <div className="stat-item">
          <label>Active</label>
          <span>{packages.filter(p => p.status === 'Active').length}</span>
        </div>
        <div className="stat-item">
          <label>Expired</label>
          <span>{packages.filter(p => p.status === 'expired').length}</span>
        </div>
        <div className="stat-item">
          <label>Total Services Used</label>
          <span>{packages.reduce((sum, p) => sum + (Number(p.servicesUsed) || 0), 0)}</span>
        </div>
      </div>
    </div>
  );
}

export default ManagePackages;
