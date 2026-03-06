/**
 * Context Export Index
 * Centralizes all context exports
 */

import { useCallback, useMemo, useState } from 'react';
import { getAuthToken } from '../utils/apiClient';
import { bookingApi } from '../utils/apiService';

export { AuthProvider, useAuth } from './AuthContext';
export { BillingProvider, useBilling } from './BillingContext';
export { NotificationProvider, useNotifications } from './NotificationContext';
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';

const getBookingAmount = (booking) => {
  if (typeof booking.amount === 'number') {
    return Number.isFinite(booking.amount) ? booking.amount : 0;
  }

  const parsedAmount = Number.parseFloat(booking.amount);
  return Number.isFinite(parsedAmount) ? parsedAmount : 0;
};

const computeBookingStats = (bookings) => {
  return bookings.reduce(
    (acc, booking) => {
      acc.totalRevenue += getBookingAmount(booking);

      const status = String(booking.status || '').toLowerCase();
      if (status === 'completed') acc.completed += 1;
      else if (status === 'confirmed') acc.confirmed += 1;
      else if (status === 'pending') acc.pending += 1;

      return acc;
    },
    {
      totalRevenue: 0,
      completed: 0,
      pending: 0,
      confirmed: 0
    }
  );
};

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(() => computeBookingStats([]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasToken = !!getAuthToken();
      const response = hasToken ? await bookingApi.listMine() : await bookingApi.listAll();
      const incomingBookings = Array.isArray(response?.data) ? response.data : [];

      setBookings(incomingBookings);
      setStats(computeBookingStats(incomingBookings));
    } catch (err) {
      setBookings([]);
      setStats(computeBookingStats([]));
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(() => {
    setStats(computeBookingStats(bookings));
  }, [bookings]);

  const addBooking = useCallback((bookingData) => {
    const booking = {
      id: bookingData.id || `BKG-${Date.now()}`,
      ...bookingData
    };

    const updatedBookings = [...bookings, booking];
    setBookings(updatedBookings);
    setStats(computeBookingStats(updatedBookings));

    return booking;
  }, [bookings]);

  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.createPublic(bookingData);
      const booking = response?.data || bookingData;

      setBookings((prev) => {
        const updatedBookings = [booking, ...prev];
        setStats(computeBookingStats(updatedBookings));
        return updatedBookings;
      });

      return { success: true, data: booking, message: response?.message };
    } catch (err) {
      setError(err);
      return { success: false, error: err?.message || 'Unable to create booking' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback((bookingId, updates) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    );

    setBookings(updatedBookings);
    setStats(computeBookingStats(updatedBookings));

    return updatedBookings.find((booking) => booking.id === bookingId) || null;
  }, [bookings]);

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.cancel(bookingId);
      const canceledBooking = response?.data;

      setBookings((prev) => {
        const updatedBookings = prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...(canceledBooking || {}), status: 'canceled' } : booking
        );
        setStats(computeBookingStats(updatedBookings));
        return updatedBookings;
      });

      return { success: true, data: canceledBooking };
    } catch (err) {
      setError(err);
      return { success: false, error: err?.message || 'Unable to cancel booking' };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = loadBookings;

  return useMemo(
    () => ({
      bookings,
      stats,
      loading,
      error,
      loadBookings,
      loadStats,
      fetchBookings,
      createBooking,
      addBooking,
      updateBooking,
      cancelBooking
    }),
    [
      bookings,
      stats,
      loading,
      error,
      loadBookings,
      loadStats,
      fetchBookings,
      createBooking,
      addBooking,
      updateBooking,
      cancelBooking
    ]
  );
};

export const usePayments = () => {
  return {
    payments: [],
    loading: false,
    error: null,
    fetchPayments: () => {},
    processPayment: () => {},
    makePayment: async (paymentData) => {
      return {
        success: true,
        data: paymentData,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };
    },
    refundPayment: () => {}
  };
};
