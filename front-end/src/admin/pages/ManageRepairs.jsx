import React, { useMemo, useState, useEffect } from 'react';
import CommonTable from '../../components/CommonTable.jsx';
import { repairApi } from '../../utils/apiService';

function ManageRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRepairs = async () => {
    try {
      const res = await repairApi.listAll();
      const raw = res?.data || res || [];
      setRepairs(raw.map(item => ({
        id: item.repairId || item._id || '',
        name: item.name || 'N/A',
        phone: item.phone || 'N/A',
        email: item.email || 'N/A',
        vehicle: item.vehicle || 'N/A',
        registration: item.registration || 'N/A',
        issue: item.issue || 'N/A',
        preferredDate: item.preferredDate || 'N/A',
        preferredTime: item.preferredTime || 'N/A',
        pickupDrop: item.pickupDrop ? 'Yes' : 'No',
        status: item.status || 'pending',
        eta: item.eta || '—',
        lastUpdate: item.lastUpdate || '—',
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A',
      })));
    } catch (err) {
      console.error('Error loading repairs:', err);
    }
  };

  useEffect(() => { loadRepairs(); }, []);

  const filteredRepairs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return repairs.filter(item => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch = !search ||
        item.name.toLowerCase().includes(search) ||
        item.phone.includes(search) ||
        item.vehicle.toLowerCase().includes(search) ||
        item.registration.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [repairs, statusFilter, searchTerm]);

  const repairColumns = useMemo(() => [
    { accessorKey: 'id', header: 'Repair ID' },
    { accessorKey: 'name', header: 'Customer' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'vehicle', header: 'Vehicle' },
    { accessorKey: 'registration', header: 'Reg. No.' },
    { accessorKey: 'issue', header: 'Issue' },
    { accessorKey: 'preferredDate', header: 'Pref. Date' },
    { accessorKey: 'preferredTime', header: 'Pref. Time' },
    { accessorKey: 'pickupDrop', header: 'Pickup/Drop' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'eta', header: 'ETA' },
    { accessorKey: 'date', header: 'Created' },
  ], []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>🔧 Manage Repairs</h1>
          <p className="header-subtitle">Total Repair Requests: {repairs.length}</p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="filter-tabs">
          {['All', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}{' '}
              <span className="badge-count">
                {status === 'All' ? repairs.length : repairs.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, vehicle or repair ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div style={{ padding: '20px' }}>
        <CommonTable
          columns={repairColumns}
          data={filteredRepairs}
          fileName="repairs-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Repairs</label>
          <span>{repairs.length}</span>
        </div>
        <div className="stat-item">
          <label>Pending</label>
          <span>{repairs.filter(r => r.status === 'pending').length}</span>
        </div>
        <div className="stat-item">
          <label>In Progress</label>
          <span>{repairs.filter(r => r.status === 'in-progress').length}</span>
        </div>
        <div className="stat-item">
          <label>Completed</label>
          <span>{repairs.filter(r => r.status === 'completed').length}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageRepairs;
