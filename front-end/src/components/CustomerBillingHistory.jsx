import React, { useState, useMemo, useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import CommonTable from './CommonTable';
import './CustomerBillingHistory.css';

const normalizePaymentStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'paid' || value === 'completed' || value === 'success' || value === 'successful') {
    return 'completed';
  }
  if (value === 'failed' || value === 'failure') {
    return 'failed';
  }
  return 'pending';
};

function CustomerBillingHistory() {
  const { user } = useAuth();
  const { fetchMyBillingRecords, loading } = useBilling();
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
          const status = normalizePaymentStatus(getValue());
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
      console.log('📊 Fetching billing records for authenticated user');
      const records = await fetchMyBillingRecords();
      console.log('✅ Billing records loaded:', records);
      setUserBillings(records);
    };
    if (user && fetchMyBillingRecords) {
      fetchBillings();
    }
  }, [user, fetchMyBillingRecords]);

  // Filter billings based on status and date range
  const filteredBillings = useMemo(() => {
    let filtered = userBillings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => normalizePaymentStatus(b.paymentStatus) === filterStatus);
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
      const normalizedStatus = normalizePaymentStatus(billing.paymentStatus);
      if (normalizedStatus === 'completed') {
        stats.completedPayments += 1;
      } else if (normalizedStatus === 'pending') {
        stats.pendingPayments += 1;
      }
      stats.totalRefunds += billing.refundAmount || 0;
    });

    return stats;
  }, [userBillings]);

  const latestSuccessfulPayment = useMemo(() => {
    const successfulRecords = userBillings.filter(
      (billing) => normalizePaymentStatus(billing.paymentStatus) === 'completed'
    );

    if (successfulRecords.length === 0) return null;

    return [...successfulRecords].sort((a, b) => {
      const aTime = new Date(a.paymentDate || a.createdAt || 0).getTime();
      const bTime = new Date(b.paymentDate || b.createdAt || 0).getTime();
      return bTime - aTime;
    })[0];
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
      normalizePaymentStatus(b.paymentStatus),
      b.paymentDate ? new Date(b.paymentDate).toLocaleDateString('en-IN') : '—',
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

      {latestSuccessfulPayment && (
        <div className="payment-success-invoice-card">
          <div className="payment-success-invoice-head">
            <h3>Payment Successful For This Booking</h3>
            <span className="payment-success-pill">SUCCESS</span>
          </div>
          <p className="payment-success-message-line">
            This booking payment is successful. You can view invoice details below.
          </p>
          <div className="payment-success-invoice-grid">
            <div>
              <span className="label">Booking ID</span>
              <span className="value">{latestSuccessfulPayment.bookingId || 'N/A'}</span>
            </div>
            <div>
              <span className="label">Service Name</span>
              <span className="value">{latestSuccessfulPayment.serviceName || 'N/A'}</span>
            </div>
            <div>
              <span className="label">Transaction ID</span>
              <span className="value">{latestSuccessfulPayment.transactionId || 'N/A'}</span>
            </div>
            <div>
              <span className="label">Invoice Number</span>
              <span className="value">{latestSuccessfulPayment.invoiceNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="label">Amount Paid</span>
              <span className="value">₹{latestSuccessfulPayment.totalAmount || latestSuccessfulPayment.amount || 0}</span>
            </div>
            <div>
              <span className="label">Payment Date</span>
              <span className="value">
                {latestSuccessfulPayment.paymentDate || latestSuccessfulPayment.createdAt
                  ? new Date(
                      latestSuccessfulPayment.paymentDate || latestSuccessfulPayment.createdAt
                    ).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

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
