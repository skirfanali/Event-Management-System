'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import { getToken } from '@/lib/token';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const intervalRef = useRef(null);
  const initializedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const data = await api.get(EP.NOTIFICATIONS.LIST, { params: { page: 0, size: 50 } });
      const list = Array.isArray(data) ? data : (data?.content || []);
      setNotifications(list);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!getToken()) return;
    try {
      const count = await api.get(EP.NOTIFICATIONS.UNREAD);
      setUnreadCount(Number(count) || 0);
    } catch { setUnreadCount(0); }
  }, []);

  // ✅ FIX: Start polling only when token exists, watch for token changes
  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // already running
    fetchNotifications();
    fetchUnreadCount();
    intervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
  }, [fetchNotifications, fetchUnreadCount]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    initializedRef.current = false;
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // ✅ FIX: Poll localStorage for token changes (fires after login/logout)
    // NotificationProvider mounts once at app root — before login.
    // Without this, notifications never load because getToken() was null at mount time.
    const checkToken = setInterval(() => {
      const hasToken = !!getToken();
      if (hasToken && !initializedRef.current) {
        initializedRef.current = true;
        startPolling();
      } else if (!hasToken && initializedRef.current) {
        stopPolling();
      }
    }, 500);

    // ✅ Also trigger immediately in case token already exists (page refresh)
    if (getToken()) {
      initializedRef.current = true;
      startPolling();
    }

    // ✅ Re-fetch when user switches back to tab
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && getToken()) {
        fetchNotifications();
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(checkToken);
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [startPolling, stopPolling, fetchNotifications, fetchUnreadCount]);

  const markRead = async (id) => {
    try {
      await api.put(EP.NOTIFICATIONS.READ(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put(EP.NOTIFICATIONS.READ_ALL);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteRead = async () => {
    try {
      await api.delete(EP.NOTIFICATIONS.DELETE_READ);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch {}
  };

  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead, deleteRead, refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};