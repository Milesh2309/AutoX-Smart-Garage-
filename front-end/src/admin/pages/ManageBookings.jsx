import React, { useState, useMemo, useEffect } from 'react';
import CommonTable from '../../components/CommonTable.jsx';

function ManageBookings() {
  const [bookings, setBookings] = useState([]);

  // Load bookings from localStorage
  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    // Add default mechanic if not set
    const processedBookings = allBookings.map(b => ({
      ...b,
      mechanic: b.mechanic || 'Not Assigned'
    }));
    setBookings(processedBookings);
  }, []);

  const bookingColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'service', header: 'Service' },
    { accessorKey: 'vehicleNumber', header: 'Vehicle' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'time', header: 'Time' },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'status', header: 'Status' },
  ], []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📅 Manage Bookings</h1>
          <p className="header-subtitle">Total Bookings: {bookings.length}</p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <CommonTable 
          columns={bookingColumns} 
          data={bookings} 
          fileName="bookings-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Revenue (All)</label>
          <span>₹{bookings.reduce((sum, b) => sum + parseInt(b.amount.replace(/[₹,]/g, '')), 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-item">
          <label>Completed Bookings</label>
          <span>{bookings.filter(b => b.status === 'Completed').length}</span>
        </div>
        <div className="stat-item">
          <label>Pending Bookings</label>
          <span>{bookings.filter(b => b.status === 'Pending').length}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageBookings;
