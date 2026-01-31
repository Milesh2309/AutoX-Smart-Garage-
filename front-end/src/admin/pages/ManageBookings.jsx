import React, { useState, useMemo } from 'react';
import CommonTable from '../../components/CommonTable';

function ManageBookings() {
  const [bookings] = useState([
    { id: 1, customer: 'John Doe', service: 'Smart Garage Services', vehicleNumber: 'MH-04-AB-1234', phone: '9876543210', date: '2025-12-30', time: '10:00 AM', status: 'Pending', amount: '₹2,499' },
    { id: 2, customer: 'Sarah Smith', service: 'Car & Bike Repair', vehicleNumber: 'DL-01-CD-5678', phone: '9876543211', date: '2025-12-29', time: '2:30 PM', status: 'Completed', amount: '₹4,500' },
    { id: 3, customer: 'Mike Johnson', service: 'Vehicle Modification', vehicleNumber: 'GJ-05-EF-9012', phone: '9876543212', date: '2025-12-28', time: '11:15 AM', status: 'In Progress', amount: '₹8,999' },
    { id: 4, customer: 'Priya Gupta', service: 'Vehicle Detailing', vehicleNumber: 'MH-02-GH-3456', phone: '9876543213', date: '2025-12-27', time: '3:00 PM', status: 'Completed', amount: '₹3,999' },
    { id: 5, customer: 'Raj Patel', service: 'Emergency Roadside Help', vehicleNumber: 'GJ-06-IJ-7890', phone: '9876543214', date: '2025-12-26', time: '9:45 PM', status: 'Completed', amount: '₹500' },
    { id: 6, customer: 'Asha Kumar', service: 'Pre-Purchase Inspection', vehicleNumber: 'DL-03-KL-1234', phone: '9876543215', date: '2025-12-25', time: '1:00 PM', status: 'In Progress', amount: '₹2,499' },
  ]);

  const bookingColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'service', header: 'Service' },
    { accessorKey: 'vehicleNumber', header: 'Vehicle Number' },
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
