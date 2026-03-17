import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const SOCKET_URL = 'http://10.135.186.195:3000'; // same host as BASE_URL in api.js

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const socketRef = useRef(null);

  // Fetch full list on mount / auth change
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationAPI.getAll(token);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    // 1. Load existing notifications
    fetchNotifications();

    // 2. Open socket and authenticate with JWT
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('notification', (newNotification) => {
      // Prepend the incoming notification and bump the unread count
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, [token]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, [token]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
