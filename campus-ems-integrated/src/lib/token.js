const TOKEN_KEY = 'ems_token';
const USER_KEY  = 'ems_user';
const REFRESH_KEY = 'ems_refresh';

export const getToken    = () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY)  : null;
export const setToken    = (t) => localStorage.setItem(TOKEN_KEY, t);
export const getRefresh  = () => typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
export const setRefresh  = (t) => localStorage.setItem(REFRESH_KEY, t);
export const clearToken  = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};
export const getUser     = () => {
  try {
    const u = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};
export const setUser     = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const isLoggedIn  = () => !!getToken();
