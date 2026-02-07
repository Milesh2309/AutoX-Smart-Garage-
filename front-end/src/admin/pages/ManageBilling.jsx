import React, { useState, useMemo, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import {
  downloadInvoicePDF,
  downloadBillingReportPDF,
} from '../../utils/invoiceGenerator';
import CommonTable from '../../components/CommonTable';
import './ManageBilling.css';

function ManageBilling() {
  const {
    billingRecords,
    fetchAllBillingRecords,
    processRefund,
    verifyInvoice,
    generateBillingReport,
    loading,
  } = useBilling();

  const [activeTab, setActiveTab] = useState('invoices');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({ amount: 0, reason: '' });
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    paymentStatus: 'all',
  });

  useEffect(() => {
    fetchAllBillingRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const billingColumns = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        size: 120,
      },
      {
        accessorKey: 'userId',
        header: 'Customer ID',
        size: 120,
      },
      {
        accessorKey: 'serviceName',
        header: 'Service',
        size: 130,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 100,
        cell: ({ getValue }) => `₹${getValue()}`,
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Method',
        size: 100,
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Status',
        size: 100,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span className={`status-badge status-${status}`}>
              {status.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentDate',
        header: 'Date',
        size: 130,
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleDateString('en-IN'),
      },
    ],
    []
  );

  // Filter billings
  const filteredBillings = useMemo(() => {
    let filtered = billingRecords;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.paymentStatus === filterStatus);
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter(b => b.paymentMethod === filterMethod);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        b =>
          b.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
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
  }, [billingRecords, filterStatus, filterMethod, searchTerm, dateRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalInvoices: filteredBillings.length,
      totalRevenue: 0,
      completedPayments: 0,
      failedPayments: 0,
      totalRefunds: 0,
    };

    filteredBillings.forEach(billing => {
      stats.totalRevenue += billing.totalAmount;
      if (billing.paymentStatus === 'completed') {
        stats.completedPayments += 1;
      } else if (billing.paymentStatus === 'failed') {
        stats.failedPayments += 1;
      }
      stats.totalRefunds += billing.refundAmount || 0;
    });

    return stats;
  }, [filteredBillings]);

  const handleRefund = async () => {
    if (selectedInvoice && refundData.amount > 0) {
      try {
        await processRefund(
          selectedInvoice.invoiceNumber,
          refundData.amount,
          refundData.reason
        );
        setShowRefundModal(false);
        setRefundData({ amount: 0, reason: '' });
        alert('Refund processed successfully!');
      } catch (err) {
        alert(`Refund failed: ${err.message}`);
      }
    }
  };

  const handleVerifyInvoice = async (invoiceNumber) => {
    try {
      await verifyInvoice(invoiceNumber);
      alert('Invoice verified successfully!');
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleDownloadInvoice = (billing) => {
    const customerData = {
      name: `Customer ${billing.userId}`,
      email: 'customer@email.com',
      phone: 'N/A',
      address: 'N/A',
    };
    downloadInvoicePDF(billing, customerData);
  };

  const handleGenerateReport = () => {
    const report = generateBillingReport(
      new Date(reportFilters.startDate),
      new Date(reportFilters.endDate),
      {
        paymentStatus: reportFilters.paymentStatus !== 'all' ? reportFilters.paymentStatus : undefined,
      }
    );

    downloadBillingReportPDF(report.records, {
      totalAmount: report.totalAmount,
      totalTransactions: report.totalTransactions,
      completedPayments: report.completedPayments,
      totalRefunds: report.totalRefunds,
    });
  };

  return (
    <div className="manage-billing">
      <div className="billing-page-header">
        <h1>💳 Billing Management</h1>
        <p>Manage invoices, verify payments, and process refunds</p>
      </div>

      {/* Statistics */}
      <div className="billing-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{statistics.totalInvoices}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{statistics.totalRevenue}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Completed Payments</div>
            <div className="stat-value">{statistics.completedPayments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-label">Failed Payments</div>
            <div className="stat-value">{statistics.failedPayments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↩️</div>
          <div className="stat-info">
            <div className="stat-label">Total Refunds</div>
            <div className="stat-value">₹{statistics.totalRefunds}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="billing-tabs">
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          📋 Invoices
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="tab-content">
          {/* Filters */}
          <div className="billing-filters-section">
            <div className="filter-box">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Invoice #, Customer ID, Service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-box">
              <label>Payment Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Payment Method:</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Date Range:</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading billing records...</p>
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Billing Records</h3>
              <p>No invoices match your filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <CommonTable data={filteredBillings} columns={billingColumns} />
              </div>

              {/* Action Buttons */}
              <div className="billing-actions-grid">
                {filteredBillings.map((billing) => (
                  <div key={billing.invoiceNumber} className="action-row">
                    <span className="invoice-ref">{billing.invoiceNumber}</span>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-download"
                        onClick={() => handleDownloadInvoice(billing)}
                        title="Download Invoice"
                      >
                        📥
                      </button>
                      <button
                        className="btn-action btn-verify"
                        onClick={() => handleVerifyInvoice(billing.invoiceNumber)}
                        title="Verify Invoice"
                      >
                        ✓
                      </button>
                      <button
                        className="btn-action btn-refund"
                        onClick={() => {
                          setSelectedInvoice(billing);
                          setShowRefundModal(true);
                        }}
                        title="Process Refund"
                      >
                        ↩️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="tab-content">
          <div className="report-section">
            <h3>📈 Generate Billing Report</h3>

            <div className="report-filters">
              <div className="filter-box">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="filter-box">
                <label>End Date:</label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="filter-box">
                <label>Payment Status:</label>
                <select
                  value={reportFilters.paymentStatus}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      paymentStatus: e.target.value,
                    })
                  }
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button className="btn-generate-report" onClick={handleGenerateReport}>
                📊 Generate & Download Report
              </button>
            </div>

            <div className="report-preview">
              <h4>Report Preview</h4>
              <div className="report-grid">
                <div className="report-item">
                  <span className="report-label">Total Transactions:</span>
                  <span className="report-value">{statistics.totalInvoices}</span>
                </div>
                <div className="report-item">
                  <span className="report-label">Total Revenue:</span>
                  <span className="report-value">₹{statistics.totalRevenue}</span>
                </div>
                <div className="report-item">
                  <span className="report-label">Completed Payments:</span>
                  <span className="report-value">{statistics.completedPayments}</span>
                </div>
                <div className="report-item">
                  <span className="report-label">Failed Payments:</span>
                  <span className="report-value">{statistics.failedPayments}</span>
                </div>
                <div className="report-item">
                  <span className="report-label">Total Refunds:</span>
                  <span className="report-value">₹{statistics.totalRefunds}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowRefundModal(false)}
            >
              ✕
            </button>

            <h3>Process Refund</h3>
            <p>Invoice: {selectedInvoice.invoiceNumber}</p>

            <div className="form-group">
              <label>Refund Amount (max ₹{selectedInvoice.totalAmount}):</label>
              <input
                type="number"
                max={selectedInvoice.totalAmount}
                value={refundData.amount}
                onChange={(e) =>
                  setRefundData({
                    ...refundData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Reason for Refund:</label>
              <textarea
                rows="4"
                value={refundData.reason}
                onChange={(e) =>
                  setRefundData({ ...refundData, reason: e.target.value })
                }
                placeholder="Enter reason for refund..."
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRefundModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleRefund}>
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBilling;
