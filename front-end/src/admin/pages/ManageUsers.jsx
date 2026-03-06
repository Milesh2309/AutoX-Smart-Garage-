import React, { useState, useEffect, useMemo } from 'react';
import CommonTable from '../../components/CommonTable.jsx';
import { usersApi } from '../../utils/apiService';

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await usersApi.list();
      const raw = res?.data || res || [];
      // Normalize inconsistent field names from different user sources
      const normalized = raw.map((u, idx) => ({
        ...u,
        id: u.userId || u._id || idx + 1,
        name: u.name || u.fullName || '—',
        email: u.email || '—',
        phone: u.phone || '—',
        role: u.role || '—',
        status: u.isActive === false ? 'Inactive' : 'Active',
        joinDate: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
      }));
      setUsers(normalized);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const [selectedUser, setSelectedUser] = useState(null);

  const userColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 100 },
    { accessorKey: 'name', header: 'Name', size: 180 },
    { accessorKey: 'email', header: 'Email', size: 250 },
    { accessorKey: 'phone', header: 'Phone', size: 140 },
    { accessorKey: 'role', header: 'Role', size: 100,
      Cell: ({ cell }) => {
        const val = (cell.getValue() || '').toLowerCase();
        const color = val === 'admin' ? '#e74c3c' : val === 'customer' ? '#2980b9' : '#7f8c8d';
        return <span style={{ fontWeight: 600, color, textTransform: 'capitalize' }}>{cell.getValue()}</span>;
      },
    },
    { accessorKey: 'status', header: 'Status', size: 100,
      Cell: ({ cell }) => {
        const active = cell.getValue() === 'Active';
        return (
          <span style={{
            padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: active ? '#e6f9ee' : '#fde8e8', color: active ? '#27ae60' : '#e74c3c',
          }}>{cell.getValue()}</span>
        );
      },
    },
    { accessorKey: 'joinDate', header: 'Join Date', size: 130 },
  ], []);

  const closeProfile = () => setSelectedUser(null);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>👥 Manage Users</h1>
        <span className="badge">{users.length} Total Users</span>
      </div>

      <div className="bookings-container">
        <CommonTable 
          columns={userColumns}
          data={users}
          filename="users"
        />
      </div>

      {selectedUser && (
        <div className="modal-backdrop" onClick={closeProfile} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && closeProfile()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-label">User Profile</p>
                <h3>{selectedUser.name}</h3>
              </div>
              <button className="modal-close" onClick={closeProfile} aria-label="Close profile">×</button>
            </div>
            <div className="modal-body">
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              <p><strong>Joined:</strong> {selectedUser.joinDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
