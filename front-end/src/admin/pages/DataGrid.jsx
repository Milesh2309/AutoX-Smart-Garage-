import React, { useState, useEffect } from 'react';
import './DataGrid.css';

function DataGrid() {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data for different views
  const mockData = {
    users: [
      { id: 1, name: 'Raj Patel', email: 'raj@example.com', phone: '9876543210', joinDate: '2025-01-15', status: 'Active', bookings: 5 },
      { id: 2, name: 'Priya Gupta', email: 'priya@example.com', phone: '9876543211', joinDate: '2025-01-10', status: 'Active', bookings: 3 },
      { id: 3, name: 'Amit Singh', email: 'amit@example.com', phone: '9876543212', joinDate: '2025-01-05', status: 'Inactive', bookings: 0 },
      { id: 4, name: 'Neha Sharma', email: 'neha@example.com', phone: '9876543213', joinDate: '2024-12-28', status: 'Active', bookings: 8 },
      { id: 5, name: 'Vikram Kumar', email: 'vikram@example.com', phone: '9876543214', joinDate: '2024-12-20', status: 'Active', bookings: 12 },
      { id: 6, name: 'Anjali Verma', email: 'anjali@example.com', phone: '9876543215', joinDate: '2024-12-15', status: 'Active', bookings: 2 },
      { id: 7, name: 'Rohit Desai', email: 'rohit@example.com', phone: '9876543216', joinDate: '2024-12-10', status: 'Inactive', bookings: 1 },
      { id: 8, name: 'Shreya Nair', email: 'shreya@example.com', phone: '9876543217', joinDate: '2024-12-05', status: 'Active', bookings: 6 },
    ],
    mechanics: [
      { id: 1, name: 'Rajeev Kumar', specialty: 'Engine Repair', experience: '8 years', phone: '9988776655', status: 'Available', rating: 4.8 },
      { id: 2, name: 'Mohit Sharma', specialty: 'Electrical', experience: '6 years', phone: '9988776656', status: 'Busy', rating: 4.6 },
      { id: 3, name: 'Suresh Patel', specialty: 'Transmission', experience: '10 years', phone: '9988776657', status: 'Available', rating: 4.9 },
      { id: 4, name: 'Arun Singh', specialty: 'Suspension', experience: '5 years', phone: '9988776658', status: 'Available', rating: 4.5 },
      { id: 5, name: 'Deepak Verma', specialty: 'Brakes', experience: '7 years', phone: '9988776659', status: 'Off Duty', rating: 4.7 },
    ],
    vehicles: [
      { id: 1, owner: 'Raj Patel', registrationNo: 'GJ01AB1234', model: 'Honda City', year: 2020, type: 'Car', status: 'Active' },
      { id: 2, owner: 'Priya Gupta', registrationNo: 'GJ01AB1235', model: 'Maruti Swift', year: 2019, type: 'Car', status: 'Active' },
      { id: 3, owner: 'Amit Singh', registrationNo: 'GJ01AB1236', model: 'Hero Splendor', year: 2021, type: 'Bike', status: 'Inactive' },
      { id: 4, owner: 'Neha Sharma', registrationNo: 'GJ01AB1237', model: 'Toyota Innova', year: 2018, type: 'SUV', status: 'Active' },
      { id: 5, owner: 'Vikram Kumar', registrationNo: 'GJ01AB1238', model: 'Hyundai i20', year: 2022, type: 'Car', status: 'Active' },
    ],
    bookings: [
      { id: 1, customer: 'Raj Patel', service: 'Engine Oil Change', date: '2025-01-24', amount: '₹500', status: 'Completed', mechanic: 'Rajeev Kumar' },
      { id: 2, customer: 'Priya Gupta', service: 'Tire Replacement', date: '2025-01-24', amount: '₹2,500', status: 'In Progress', mechanic: 'Mohit Sharma' },
      { id: 3, customer: 'Neha Sharma', service: 'Full Service', date: '2025-01-23', amount: '₹5,000', status: 'Completed', mechanic: 'Suresh Patel' },
      { id: 4, customer: 'Vikram Kumar', service: 'AC Repair', date: '2025-01-25', amount: '₹1,500', status: 'Pending', mechanic: 'Arun Singh' },
    ],
    parts: [
      { id: 1, name: 'Engine Oil 5L', partNo: 'MOB001', quantity: 45, unitPrice: '₹800', category: 'Oils', supplier: 'Mobil India' },
      { id: 2, name: 'Air Filter', partNo: 'AF002', quantity: 120, unitPrice: '₹300', category: 'Filters', supplier: 'Bosch' },
      { id: 3, name: 'Spark Plug Set', partNo: 'SP003', quantity: 85, unitPrice: '₹600', category: 'Ignition', supplier: 'NGK' },
      { id: 4, name: 'Brake Pads', partNo: 'BP004', quantity: 35, unitPrice: '₹1,200', category: 'Brakes', supplier: 'Brembo' },
    ],
  };

  useEffect(() => {
    // Load data based on active tab
    const tabData = mockData[activeTab] || [];
    setData(tabData);
    setCurrentPage(1);
    setSearchTerm('');
  }, [activeTab]);

  useEffect(() => {
    // Filter and search data
    let filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredData(filtered);
  }, [data, searchTerm, sortBy, sortOrder]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getColumns = () => {
    switch (activeTab) {
      case 'users':
        return ['id', 'name', 'email', 'phone', 'joinDate', 'status', 'bookings'];
      case 'mechanics':
        return ['id', 'name', 'specialty', 'experience', 'phone', 'status', 'rating'];
      case 'vehicles':
        return ['id', 'owner', 'registrationNo', 'model', 'year', 'type', 'status'];
      case 'bookings':
        return ['id', 'customer', 'service', 'date', 'amount', 'status', 'mechanic'];
      case 'parts':
        return ['id', 'name', 'partNo', 'quantity', 'unitPrice', 'category', 'supplier'];
      default:
        return [];
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
      case 'completed':
        return '#10b981';
      case 'pending':
      case 'busy':
        return '#f59e0b';
      case 'inactive':
      case 'in progress':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatHeaderName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="datagrid-container">
      <div className="datagrid-header">
        <h1>📊 Data Grid View</h1>
        <p>View and manage all system data</p>
      </div>

      <div className="datagrid-tabs">
        {['users', 'mechanics', 'vehicles', 'bookings', 'parts'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="datagrid-controls">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="id">Sort by ID</option>
          {activeTab === 'users' && (
            <>
              <option value="name">Sort by Name</option>
              <option value="joinDate">Sort by Join Date</option>
            </>
          )}
          {activeTab === 'mechanics' && (
            <>
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
            </>
          )}
          {activeTab === 'bookings' && (
            <>
              <option value="customer">Sort by Customer</option>
              <option value="date">Sort by Date</option>
            </>
          )}
        </select>
        <button
          className="sort-order-btn"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
        </button>
      </div>

      <div className="datagrid-wrapper">
        <table className="datagrid-table">
          <thead>
            <tr>
              {getColumns().map(col => (
                <th key={col}>{formatHeaderName(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <tr key={idx}>
                  {getColumns().map(col => (
                    <td key={`${idx}-${col}`}>
                      {col.includes('status') ? (
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusBadgeColor(item[col]) }}
                        >
                          {item[col]}
                        </span>
                      ) : (
                        item[col]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={getColumns().length} className="no-data">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="datagrid-pagination">
        <div className="pagination-info">
          Showing {Math.min(indexOfFirstItem + 1, filteredData.length)} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataGrid;
