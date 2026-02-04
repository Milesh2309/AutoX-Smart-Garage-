import React, { createContext, useContext, useState, useCallback } from 'react';

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
          userId,
          bookingId,
          amount: paymentData.amount,
          serviceName: paymentData.serviceName,
          paymentMethod: paymentData.method,
          paymentStatus: 'completed',
          paymentDate: new Date().toISOString(),
          transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          tax: 0,
          totalAmount: paymentData.amount,
          refundStatus: 'none',
          refundAmount: 0,
          notes: '',
          createdAt: new Date().toISOString(),
        };

        // TODO: Send to backend API
        // const response = await fetch('/api/billing/create', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify(billingRecord)
        // });
        // const result = await response.json();

        // Local state update for demo
        setBillingRecords((prev) => [...prev, billingRecord]);
        setInvoices((prev) => [...prev, billingRecord]);

        return billingRecord;
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

      // TODO: Call backend API
      // const response = await fetch(`/api/billing/user/${userId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });
      // const data = await response.json();

      // For demo, return local state
      return billingRecords.filter((r) => r.userId === userId);
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [billingRecords]);

  // Fetch all billing records (admin)
  const fetchAllBillingRecords = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Call backend API with filters
        // const queryParams = new URLSearchParams(filters);
        // const response = await fetch(`/api/billing/all?${queryParams}`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   }
        // });
        // const data = await response.json();

        return billingRecords;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [billingRecords]
  );

  // Process refund
  const processRefund = useCallback(
    async (invoiceNumber, refundAmount, reason) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Call backend API
        // const response = await fetch('/api/billing/refund', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify({
        //     invoiceNumber,
        //     refundAmount,
        //     reason,
        //     refundDate: new Date().toISOString()
        //   })
        // });
        // const result = await response.json();

        // Local state update
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

      // TODO: Call backend API
      // const response = await fetch(`/api/billing/verify/${invoiceNumber}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });

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
