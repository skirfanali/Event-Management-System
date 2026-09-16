'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, getUser, setToken, setUser, clearToken, setRefresh, getRefresh } from '@/lib/token';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUserState] = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadUser = useCallback(async () => {
    const token  = getToken();
    const stored = getUser();
    if (!token) { setLoading(false); return; }
    if (stored) setUserState(stored);
    try {
      const me = await api.get(EP.AUTH.ME);
      const userData = {
        id:            me.id,
        name:          me.name,
        email:         me.email,
        role:          me.role,
        avatarUrl:     me.avatarUrl,
        college:       me.college,
        branch:        me.branch,
        year:          me.year,
        phone:         me.phone,
        bio:           me.bio,
        emailVerified: me.emailVerified,
      };
      setUser(userData);
      setUserState(userData);
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
    const userData = {
      id:            data.id,
      name:          data.name,
      email:         data.email,
      role:          data.role,
      avatarUrl:     data.avatarUrl,
      emailVerified: data.emailVerified,
    };
    setUser(userData);
    setUserState(userData);
    toast.success(`Welcome back, ${data.name}!`);
    return userData;
  };

  const register = async (payload) => {
    // ✅ FIX: Backend no longer returns tokens on register (email verification
    // required first). Just call the API — on success redirect to verify-email.
    // Do NOT attempt to auto-login or read accessToken here.
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
    // data here is AuthResponse with null tokens — just return it
    // The register page handles the redirect to /verify-email
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

  const updateProfile = async (payload) => {
    const data    = await api.put(EP.USERS.PROFILE, payload);
    const updated = { ...user, ...data };
    setUser(updated);
    setUserState(updated);
    toast.success('Profile updated!');
    return updated;
  };

  const refreshUser = async () => { await loadUser(); };

  const isAdmin     = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isUser      = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateProfile, refreshUser,
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