/**
 * Context Export Index
 * Centralizes all context exports
 */

import { useCallback, useMemo, useState } from 'react';

export { AuthProvider, useAuth } from './AuthContext';
export { BillingProvider, useBilling } from './BillingContext';
export { NotificationProvider, useNotifications } from './NotificationContext';
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';

const BOOKINGS_STORAGE_KEY = 'bookings';

const readStoredBookings = () => {
  const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const writeStoredBookings = (bookings) => {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

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

  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const storedBookings = readStoredBookings();
      setBookings(storedBookings);
      setStats(computeBookingStats(storedBookings));
    } catch (err) {
      setBookings([]);
      setStats(computeBookingStats([]));
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(() => {
    const sourceBookings = bookings.length ? bookings : readStoredBookings();
    setStats(computeBookingStats(sourceBookings));
  }, [bookings]);

  const addBooking = useCallback((bookingData) => {
    const storedBookings = readStoredBookings();
    const booking = {
      id: bookingData.id || `BKG-${Date.now()}`,
      ...bookingData
    };
    const updatedBookings = [...storedBookings, booking];

    writeStoredBookings(updatedBookings);
    setBookings(updatedBookings);
    setStats(computeBookingStats(updatedBookings));

    return booking;
  }, []);

  const createBooking = useCallback(async (bookingData) => {
    setError(null);

    try {
      const booking = addBooking(bookingData);
      return { success: true, data: booking };
    } catch (err) {
      setError(err);
      return { success: false, error: err?.message || 'Unable to create booking' };
    }
  }, [addBooking]);

  const updateBooking = useCallback((bookingId, updates) => {
    const storedBookings = readStoredBookings();
    const updatedBookings = storedBookings.map((booking) =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    );

    writeStoredBookings(updatedBookings);
    setBookings(updatedBookings);
    setStats(computeBookingStats(updatedBookings));

    return updatedBookings.find((booking) => booking.id === bookingId) || null;
  }, []);

  const cancelBooking = useCallback((bookingId) => {
    return updateBooking(bookingId, { status: 'cancelled' });
  }, [updateBooking]);

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
    refundPayment: () => {}
  };
};
