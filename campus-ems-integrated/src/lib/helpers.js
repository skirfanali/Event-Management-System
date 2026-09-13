import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (d, fmt = 'MMM dd, yyyy') => {
  try { return format(typeof d === 'string' ? parseISO(d) : d, fmt); } catch { return 'Invalid date'; }
};

export const formatRelative = (d) => {
  try { return formatDistanceToNow(typeof d === 'string' ? parseISO(d) : d, { addSuffix: true }); } catch { return ''; }
};

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(n);

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '…' : str;

export const slugify = (str) => str?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getStatusColor = (status) => ({
  UPCOMING:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ONGOING:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED:  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  CANCELLED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  DRAFT:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}[status] || 'bg-gray-100 text-gray-600');

export const getRoleColor = (role) => ({
  ADMIN:     'bg-purple-100 text-purple-700',
  ORGANIZER: 'bg-brand-100 text-brand-700',
  USER:      'bg-green-100 text-green-700',
}[role] || 'bg-gray-100 text-gray-600');

export const debounce = (fn, delay) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
};
