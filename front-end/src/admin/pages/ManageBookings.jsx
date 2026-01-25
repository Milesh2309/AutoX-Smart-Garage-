import React, { useState } from 'react';

function ManageBookings() {
  const [bookings, setBookings] = useState([
    { id: 1, customer: 'John Doe', service: 'Smart Garage Services', vehicleNumber: 'MH-04-AB-1234', phone: '9876543210', date: '2025-12-30', time: '10:00 AM', status: 'Pending', amount: '₹2,499' },
    { id: 2, customer: 'Sarah Smith', service: 'Car & Bike Repair', vehicleNumber: 'DL-01-CD-5678', phone: '9876543211', date: '2025-12-29', time: '2:30 PM', status: 'Completed', amount: '₹4,500' },
    { id: 3, customer: 'Mike Johnson', service: 'Vehicle Modification', vehicleNumber: 'GJ-05-EF-9012', phone: '9876543212', date: '2025-12-28', time: '11:15 AM', status: 'In Progress', amount: '₹8,999' },
    { id: 4, customer: 'Priya Gupta', service: 'Vehicle Detailing', vehicleNumber: 'MH-02-GH-3456', phone: '9876543213', date: '2025-12-27', time: '3:00 PM', status: 'Completed', amount: '₹3,999' },
    { id: 5, customer: 'Raj Patel', service: 'Emergency Roadside Help', vehicleNumber: 'GJ-06-IJ-7890', phone: '9876543214', date: '2025-12-26', time: '9:45 PM', status: 'Completed', amount: '₹500' },
    { id: 6, customer: 'Asha Kumar', service: 'Pre-Purchase Inspection', vehicleNumber: 'DL-03-KL-1234', phone: '9876543215', date: '2025-12-25', time: '1:00 PM', status: 'In Progress', amount: '₹2,499' },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📅 Manage Bookings</h1>
          <p className="header-subtitle">Total Bookings: {bookings.length}</p>
        </div>
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-tabs">
        {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status} <span className="badge-count">{getStatusCount(status)}</span>
          </button>
        ))}
      </div>

      <div className="bookings-container">
        {filteredBookings.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Vehicle Number</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.customer}</strong>
                  </td>
                  <td>{booking.service}</td>
                  <td><strong>{booking.vehicleNumber}</strong></td>
                  <td><a href={`tel:${booking.phone}`}>{booking.phone}</a></td>
                  <td>{booking.date} @ {booking.time}</td>
                  <td><strong>{booking.amount}</strong></td>
                  <td>
                    <select
                      className={`status-select status-${booking.status.toLowerCase().replace(' ', '-')}`}
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="btn-edit" 
                      title="View Details"
                      onClick={() => handleViewBooking(booking)}
                    >
                      👁
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No bookings found</p>
          </div>
        )}
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

      {selectedBooking && (
        <div className="modal-backdrop" onClick={closeBookingDetails}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-label">Booking Details</p>
                <h3>{selectedBooking.customer}</h3>
              </div>
              <button className="modal-close" onClick={closeBookingDetails} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p><strong>Service:</strong> {selectedBooking.service}</p>
              <p><strong>Vehicle Number:</strong> {selectedBooking.vehicleNumber}</p>
              <p><strong>Phone:</strong> <a href={`tel:${selectedBooking.phone}`}>{selectedBooking.phone}</a></p>
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Amount:</strong> {selectedBooking.amount}</p>
              <p><strong>Status:</strong> <span className={`status status-${selectedBooking.status.toLowerCase().replace(' ', '-')}`}>{selectedBooking.status}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBookings;
