import React, { useState, useMemo } from 'react';
import CommonTable from '../../components/CommonTable.jsx';

function ManageUsers() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '9876543210', vehicleNumber: 'MH-04-AB-1234', joinDate: '2025-12-15' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '9765432109', vehicleNumber: 'DL-01-CD-5678', joinDate: '2025-12-10' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '9654321098', vehicleNumber: 'GJ-05-EF-9012', joinDate: '2025-12-05' },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);

  const userColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'vehicleNumber', header: 'Vehicle Number' },
    { accessorKey: 'joinDate', header: 'Join Date' },
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
              <p><strong>Vehicle Number:</strong> {selectedUser.vehicleNumber}</p>
              <p><strong>Joined:</strong> {selectedUser.joinDate}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
