import React, { useState, useMemo, useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import CommonTable from './CommonTable';
import './CustomerBillingHistory.css';

function CustomerBillingHistory() {
  const { user } = useAuth();
  const { billingRecords, fetchUserBillingRecords, loading } = useBilling();
  const [userBillings, setUserBillings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  const billingColumns = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        size: 120,
      },
      {
        accessorKey: 'serviceName',
        header: 'Service',
        size: 130,
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        size: 100,
        cell: ({ getValue }) => `₹${getValue()}`,
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        size: 120,
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Status',
        size: 100,
        cell: ({ getValue }) => {
          const status = getValue() || 'pending';
          return (
            <span className={`status-badge status-${status}`}>
              {status.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentDate',
        header: 'Payment Date',
        size: 130,
        cell: ({ getValue }) => {
          const v = getValue();
          if (!v) return '—';
          const d = new Date(v);
          return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        },
      },
    ],
    []
  );

  // Fetch user billing records on mount
  useEffect(() => {
    const fetchBillings = async () => {
      const records = await fetchUserBillingRecords(user?.id);
      setUserBillings(records);
    };
    if (user?.id) {
      fetchBillings();
    }
  }, [user?.id, fetchUserBillingRecords]);

  // Filter billings based on status and date range
  const filteredBillings = useMemo(() => {
    let filtered = userBillings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.paymentStatus === filterStatus);
    }

    // Filter by date range
    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filterDateRange) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(b => new Date(b.paymentDate) >= startDate);
    }

    return filtered;
  }, [userBillings, filterStatus, filterDateRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalBillings: userBillings.length,
      totalAmount: 0,
      completedPayments: 0,
      pendingPayments: 0,
      totalRefunds: 0,
    };

    userBillings.forEach(billing => {
      stats.totalAmount += billing.totalAmount;
      if (billing.paymentStatus === 'completed') {
        stats.completedPayments += 1;
      } else if (billing.paymentStatus === 'pending') {
        stats.pendingPayments += 1;
      }
      stats.totalRefunds += billing.refundAmount || 0;
    });

    return stats;
  }, [userBillings]);

  const handleDownloadInvoice = (billing) => {
    const customerData = {
      name: user?.name || user?.email?.split('@')[0] || 'Customer',
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      address: user?.address || 'N/A',
    };
    downloadInvoicePDF(billing, customerData);
  };

  const handleExportAll = () => {
    // Export all filtered billings as CSV
    const headers = [
      'Invoice Number',
      'Service',
      'Amount',
      'Payment Method',
      'Status',
      'Payment Date',
    ];
    const rows = filteredBillings.map(b => [
      b.invoiceNumber,
      b.serviceName,
      b.totalAmount,
      b.paymentMethod,
      b.paymentStatus,
      new Date(b.paymentDate).toLocaleDateString('en-IN'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="customer-billing-history">
      <div className="billing-header">
        <h2>📄 Billing & Invoice History</h2>
        <p>Manage and download your invoices and billing records</p>
      </div>

      {/* Statistics Cards */}
      <div className="billing-statistics">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Billings</div>
            <div className="stat-value">{statistics.totalBillings}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Amount</div>
            <div className="stat-value">₹{statistics.totalAmount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{statistics.completedPayments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{statistics.pendingPayments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↩️</div>
          <div className="stat-content">
            <div className="stat-label">Refunded</div>
            <div className="stat-value">₹{statistics.totalRefunds}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="billing-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Payment Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateFilter">Date Range:</label>
          <select
            id="dateFilter"
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last 1 Year</option>
          </select>
        </div>

        <button className="btn-export" onClick={handleExportAll}>
          📥 Export to CSV
        </button>
      </div>

      {/* Billings Table */}
      <div className="billing-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading billing records...</p>
          </div>
        ) : filteredBillings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Billing Records Found</h3>
            <p>You don't have any billing records matching your filters.</p>
          </div>
        ) : (
          <>
            <CommonTable data={filteredBillings} columns={billingColumns} />

            {/* Action Buttons */}
            <div className="billing-actions">
              {filteredBillings.map((billing) => (
                <div key={billing.invoiceNumber} className="billing-row-actions">
                  <button
                    className="btn-download-pdf"
                    onClick={() => handleDownloadInvoice(billing)}
                    title={`Download invoice ${billing.invoiceNumber}`}
                  >
                    📥 PDF
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Help Section */}
      <div className="billing-help">
        <h3>📚 Need Help?</h3>
        <div className="help-grid">
          <div className="help-item">
            <span className="help-icon">❓</span>
            <div>
              <h4>How to download invoices?</h4>
              <p>Click the "📥 PDF" button next to any billing record to download it.</p>
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">💳</span>
            <div>
              <h4>Payment issues?</h4>
              <p>Contact our support team at support@garageservices.com</p>
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">↩️</span>
            <div>
              <h4>Request a refund?</h4>
              <p>Use the refund request feature in your account settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerBillingHistory;
