import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const storageKey = `notifications_${role}_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse notifications:', e);
        }
      } else {
        // Add some demo notifications on first load
        const demoNotifications = getDemoNotifications(role);
        setNotifications(demoNotifications);
      }
    } else {
      setNotifications([]);
    }
  }, [user, role]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user) {
      const storageKey = `notifications_${role}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, user, role]);

  const getDemoNotifications = (userRole) => {
    const now = new Date();
    if (userRole === 'admin') {
      return [
        {
          id: Date.now() + 1,
          type: 'booking',
          title: 'New Booking Created',
          message: 'Customer John Doe booked Oil Change service',
          timestamp: new Date(now - 5 * 60000).toISOString(),
          read: false,
          icon: '📅',
        },
        {
          id: Date.now() + 2,
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of ₹2,500 received for Invoice #1234',
          timestamp: new Date(now - 15 * 60000).toISOString(),
          read: false,
          icon: '💰',
        },
        {
          id: Date.now() + 3,
          type: 'service',
          title: 'Service Completed',
          message: 'Brake Inspection completed for GJ-01-AB-1234',
          timestamp: new Date(now - 30 * 60000).toISOString(),
          read: false,
          icon: '✅',
        },
        {
          id: Date.now() + 4,
          type: 'mechanic',
          title: 'Mechanic Assigned',
          message: 'Rajesh Kumar assigned to service #5678',
          timestamp: new Date(now - 45 * 60000).toISOString(),
          read: true,
          icon: '🔧',
        },
      ];
    } else {
      return [
        {
          id: Date.now() + 1,
          type: 'booking',
          title: 'Booking Confirmed',
          message: 'Your Oil Change service is scheduled for tomorrow',
          timestamp: new Date(now - 10 * 60000).toISOString(),
          read: false,
          icon: '✅',
        },
        {
          id: Date.now() + 2,
          type: 'payment',
          title: 'Payment Successful',
          message: 'Payment of ₹2,500 processed successfully',
          timestamp: new Date(now - 20 * 60000).toISOString(),
          read: false,
          icon: '💳',
        },
        {
          id: Date.now() + 3,
          type: 'service',
          title: 'Service Completed',
          message: 'Your vehicle service has been completed',
          timestamp: new Date(now - 60 * 60000).toISOString(),
          read: false,
          icon: '🎉',
        },
        {
          id: Date.now() + 4,
          type: 'mechanic',
          title: 'Mechanic Assigned',
          message: 'Mechanic Amit is on the way to your location',
          timestamp: new Date(now - 90 * 60000).toISOString(),
          read: true,
          icon: '🚗',
        },
      ];
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
