'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, getUser, setToken, setUser, clearToken, setRefresh, getRefresh } from '@/lib/token';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// ✅ FIX: Central function to build user object from any API response
// Ensures organization, designation, website are always included
const buildUserData = (data) => ({
  id:            data.id,
  name:          data.name,
  email:         data.email,
  role:          data.role,
  avatarUrl:     data.avatarUrl,
  phone:         data.phone,
  bio:           data.bio,
  // Student fields
  college:       data.college,
  branch:        data.branch,
  year:          data.year,
  // ✅ NEW: Organizer fields — were missing, causing blank display after refresh
  organization:  data.organization,
  designation:   data.designation,
  website:       data.website,
  emailVerified: data.emailVerified,
  active:        data.active,
});

export function AuthProvider({ children }) {
  const [user,    setUserState] = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadUser = useCallback(async () => {
    const token  = getToken();
    const stored = getUser();
    if (!token) { setLoading(false); return; }
    if (stored) setUserState(stored); // optimistic render
    try {
      const me = await api.get(EP.AUTH.ME);
      // ✅ FIX: use buildUserData so all fields including organizer ones are included
      const userData = buildUserData(me);
      setUser(userData);       // persist to localStorage
      setUserState(userData);  // update React state
    } catch {
      clearToken();
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const data  = await api.post(EP.AUTH.LOGIN, credentials);
    const token = data.accessToken || data.token;
    if (!token) throw new Error('No token received from server');
    setToken(token);
    if (data.refreshToken) setRefresh(data.refreshToken);
    const userData = buildUserData(data);
    setUser(userData);
    setUserState(userData);
    toast.success(`Welcome back, ${data.name}!`);
    return userData;
  };

  const register = async (payload) => {
    const data = await api.post(EP.AUTH.REGISTER, {
      name:     payload.name,
      email:    payload.email,
      password: payload.password,
      role:     payload.role || 'USER',
      college:  payload.college,
      branch:   payload.branch,
      year:     payload.year,
      phone:    payload.phone,
    });
    if (data.accessToken) {
      setToken(data.accessToken);
      if (data.refreshToken) setRefresh(data.refreshToken);
      const userData = buildUserData(data);
      setUser(userData);
      setUserState(userData);
    }
    toast.success('Account created! Please verify your email.');
    return data;
  };

  const logout = async () => {
    try {
      const refresh = getRefresh();
      if (refresh) await api.post(EP.AUTH.LOGOUT + '?refreshToken=' + refresh);
    } catch {}
    clearToken();
    setUserState(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // ✅ FIX: updateProfile now uses buildUserData and also persists to localStorage
  const updateProfile = async (payload) => {
    const data    = await api.put(EP.USERS.PROFILE, payload);
    const updated = buildUserData({ ...user, ...data });
    setUser(updated);
    setUserState(updated);
    toast.success('Profile updated!');
    return updated;
  };

  // ✅ FIX: Export setUser so settings/profile pages can update state after direct api calls
  const setUserContext = (updater) => {
    setUserState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setUser(next); // also persist to localStorage
      return next;
    });
  };

  const refreshUser = async () => { await loadUser(); };

  const isAdmin     = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isUser      = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      updateProfile, refreshUser,
      setUser: setUserContext,   // ✅ exported so pages can call setUser(prev => ...)
      isAdmin, isOrganizer, isUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};