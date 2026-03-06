import React, { createContext, useContext, useState, useCallback } from 'react';
import { billingApi } from '../utils/apiService';

const BillingContext = createContext();

export const BillingProvider = ({ children }) => {
  const [billingRecords, setBillingRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate unique invoice number
  const generateInvoiceNumber = useCallback(() => {
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${dateString}-${randomNumber}`;
  }, []);

  // Create billing record after successful payment
  const createBillingRecord = useCallback(
    async (paymentData, userId, bookingId) => {
      try {
        setLoading(true);
        setError(null);

        const invoiceNumber = generateInvoiceNumber();
        const billingRecord = {
          invoiceNumber,
          userId: String(userId),
          bookingId,
          amount: paymentData.amount,
          serviceName: paymentData.serviceName,
          paymentMethod: paymentData.method,
          currency: paymentData.currency || 'INR',
          paymentStatus: 'pending',
          paymentDate: new Date().toISOString(),
          transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          tax: 0,
          totalAmount: paymentData.amount,
          refundStatus: 'none',
          refundAmount: 0,
          notes: '',
          createdAt: new Date().toISOString(),
        };

        const response = await billingApi.create({
          userId: String(userId),
          amount: paymentData.amount,
          currency: billingRecord.currency,
        });

        const createdRecord = response?.data || billingRecord;
        setBillingRecords((prev) => [createdRecord, ...prev]);
        setInvoices((prev) => [createdRecord, ...prev]);

        return createdRecord;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [generateInvoiceNumber]
  );

  // Fetch billing records for user
  const fetchUserBillingRecords = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await billingApi.listByUser(userId);
      const raw = Array.isArray(response?.data) ? response.data : [];
      // Normalize field names from MongoDB to what the UI expects
      const records = raw.map(r => ({
        ...r,
        paymentStatus: r.paymentStatus || r.status || 'pending',
        paymentDate: r.paymentDate || r.createdAt || '',
        totalAmount: r.totalAmount || r.amount || 0,
        serviceName: r.serviceName || r.bookingId || '—',
        paymentMethod: r.paymentMethod || r.method || '—',
        refundAmount: r.refundAmount || 0,
      }));
      setBillingRecords(records);
      setInvoices(records);
      return records;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all billing records (admin)
  const fetchAllBillingRecords = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams(filters).toString();
        const response = await billingApi.listAll(queryParams);
        const raw = Array.isArray(response?.data) ? response.data : [];
        // Normalize field names from MongoDB to what the UI expects
        const records = raw.map(r => ({
          ...r,
          paymentStatus: r.paymentStatus || r.status || 'pending',
          paymentDate: r.paymentDate || r.createdAt || '',
          totalAmount: r.totalAmount || r.amount || 0,
          serviceName: r.serviceName || r.bookingId || '—',
          paymentMethod: r.paymentMethod || r.method || '—',
          refundAmount: r.refundAmount || 0,
        }));
        setBillingRecords(records);
        setInvoices(records);
        return records;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Process refund
  const processRefund = useCallback(
    async (invoiceNumber, refundAmount, reason) => {
      try {
        setLoading(true);
        setError(null);

        await billingApi.refund({ invoiceNumber, reason, refundAmount });

        setBillingRecords((prev) =>
          prev.map((record) =>
            record.invoiceNumber === invoiceNumber
              ? {
                  ...record,
                  refundStatus: 'processing',
                  refundAmount,
                  notes: reason,
                }
              : record
          )
        );

        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Verify invoice (admin)
  const verifyInvoice = useCallback(async (invoiceNumber) => {
    try {
      setLoading(true);
      setError(null);

      await billingApi.verify(invoiceNumber);

      setBillingRecords((prev) =>
        prev.map((record) =>
          record.invoiceNumber === invoiceNumber
            ? { ...record, verified: true, verifiedAt: new Date().toISOString() }
            : record
        )
      );

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate billing report
  const generateBillingReport = useCallback(
    (startDate, endDate, filters = {}) => {
      const filtered = billingRecords.filter((record) => {
        const recordDate = new Date(record.paymentDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return (
          recordDate >= start &&
          recordDate <= end &&
          (!filters.paymentStatus ||
            record.paymentStatus === filters.paymentStatus) &&
          (!filters.paymentMethod ||
            record.paymentMethod === filters.paymentMethod)
        );
      });

      const totalAmount = filtered.reduce((sum, r) => sum + r.totalAmount, 0);
      const totalTransactions = filtered.length;
      const completedPayments = filtered.filter(
        (r) => r.paymentStatus === 'completed'
      ).length;
      const totalRefunds = filtered.reduce((sum, r) => sum + r.refundAmount, 0);

      return {
        totalAmount,
        totalTransactions,
        completedPayments,
        totalRefunds,
        records: filtered,
        generatedAt: new Date().toISOString(),
      };
    },
    [billingRecords]
  );

  const value = {
    billingRecords,
    invoices,
    loading,
    error,
    createBillingRecord,
    fetchUserBillingRecords,
    fetchAllBillingRecords,
    processRefund,
    verifyInvoice,
    generateBillingReport,
    generateInvoiceNumber,
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return context;
};
