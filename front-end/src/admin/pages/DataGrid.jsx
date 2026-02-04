import React, { useState, useEffect, useMemo } from 'react';
import './DataGrid.css';
import CommonTable from '../../components/CommonTable.jsx';

function DataGrid() {
  const [activeTab, setActiveTab] = useState('users');

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

  // Define columns for each tab
  const getTableColumns = () => {
    switch (activeTab) {
      case 'users':
        return [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
          { accessorKey: 'phone', header: 'Phone' },
          { accessorKey: 'joinDate', header: 'Join Date' },
          { accessorKey: 'status', header: 'Status' },
          { accessorKey: 'bookings', header: 'Bookings' },
        ];
      case 'mechanics':
        return [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'specialty', header: 'Specialty' },
          { accessorKey: 'experience', header: 'Experience' },
          { accessorKey: 'phone', header: 'Phone' },
          { accessorKey: 'status', header: 'Status' },
          { accessorKey: 'rating', header: 'Rating' },
        ];
      case 'vehicles':
        return [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'owner', header: 'Owner' },
          { accessorKey: 'registrationNo', header: 'Registration No' },
          { accessorKey: 'model', header: 'Model' },
          { accessorKey: 'year', header: 'Year' },
          { accessorKey: 'type', header: 'Type' },
          { accessorKey: 'status', header: 'Status' },
        ];
      case 'bookings':
        return [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'customer', header: 'Customer' },
          { accessorKey: 'service', header: 'Service' },
          { accessorKey: 'date', header: 'Date' },
          { accessorKey: 'amount', header: 'Amount' },
          { accessorKey: 'status', header: 'Status' },
          { accessorKey: 'mechanic', header: 'Mechanic' },
        ];
      case 'parts':
        return [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Part Name' },
          { accessorKey: 'partNo', header: 'Part No' },
          { accessorKey: 'quantity', header: 'Quantity' },
          { accessorKey: 'unitPrice', header: 'Unit Price' },
          { accessorKey: 'category', header: 'Category' },
          { accessorKey: 'supplier', header: 'Supplier' },
        ];
      default:
        return [];
    }
  };

  const columns = useMemo(() => getTableColumns(), [activeTab]);
  const data = mockData[activeTab] || [];

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

      <div style={{ padding: '20px' }}>
        <CommonTable 
          columns={columns} 
          data={data} 
          fileName={`${activeTab}-data`}
          showSelection={true}
        />
      </div>
    </div>
  );
}

export default DataGrid;
