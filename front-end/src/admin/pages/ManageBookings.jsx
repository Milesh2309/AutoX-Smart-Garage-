import React, { useMemo, useEffect } from 'react';
import { useBookings } from '../../context';
import CommonTable from '../../components/CommonTable.jsx';

function ManageBookings() {
  const { bookings, loadBookings, stats, loadStats } = useBookings();

  // Load bookings and stats on mount
  useEffect(() => {
    loadBookings();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format bookings data for table display
  const formattedBookings = useMemo(() => {
    return bookings.map(booking => ({
      id: booking.id,
      customer: booking.customerName || booking.customer || 'N/A',
      service: booking.serviceName || booking.service || 'N/A',
      vehicleNumber: booking.vehicleNumber || 'N/A',
      phone: booking.phone || 'N/A',
      date: booking.date || 'N/A',
      time: booking.timeSlot || booking.time || 'N/A',
      amount: typeof booking.amount === 'number' ? `₹${booking.amount}` : booking.amount,
      status: booking.status || 'pending',
    }));
  }, [bookings]);

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
          data={formattedBookings} 
          fileName="bookings-data"
          showSelection={true}
        />
      </div>

      <div className="booking-stats">
        <div className="stat-item">
          <label>Total Revenue</label>
          <span>₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
        </div>
        <div className="stat-item">
          <label>Completed Bookings</label>
          <span>{stats?.completed || 0}</span>
        </div>
        <div className="stat-item">
          <label>Pending Bookings</label>
          <span>{stats?.pending || 0}</span>
        </div>
        <div className="stat-item">
          <label>Confirmed Bookings</label>
          <span>{stats?.confirmed || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default ManageBookings;
