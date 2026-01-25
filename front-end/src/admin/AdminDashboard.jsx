import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import AdminNav from './AdminNav';
import Dashboard from './pages/Dashboard';
import ManageServices from './pages/ManageServices';
import ManageBookings from './pages/ManageBookings';
import ManageBreakdown from './pages/ManageBreakdown';
import ManageMechanics from './pages/ManageMechanics';
import ManageAssignments from './pages/ManageAssignments';
import ManageModifications from './pages/ManageModifications';
import ManageUsers from './pages/ManageUsers';
import AdminSettings from './pages/AdminSettings';
import ManageInventory from './pages/ManageInventory';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        adminUsername={user?.name || 'Admin'}
        onLogout={handleLogout}
      />
      
      <div className="admin-content">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'services' && <ManageServices />}
        {currentPage === 'bookings' && <ManageBookings />}
        {currentPage === 'breakdown' && <ManageBreakdown />}
        {currentPage === 'mechanics' && <ManageMechanics />}
        {currentPage === 'inventory' && <ManageInventory />}
        {currentPage === 'assignments' && <ManageAssignments />}
        {currentPage === 'modifications' && <ManageModifications />}
        {currentPage === 'users' && <ManageUsers />}
        {currentPage === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}

export default AdminDashboard;
