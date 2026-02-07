/**
 * Context Export Index
 * Centralizes all context exports
 */

export { AuthProvider, useAuth } from './AuthContext';
export { BillingProvider, useBilling } from './BillingContext';
export { NotificationProvider, useNotifications } from './NotificationContext';
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';

// Placeholder for hooks that may be used but not yet implemented
export const useBookings = () => {
  return {
    bookings: [],
    loading: false,
    error: null,
    fetchBookings: () => {},
    addBooking: () => {},
    updateBooking: () => {},
    cancelBooking: () => {}
  };
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
