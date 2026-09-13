'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import toast from 'react-hot-toast';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [wishlist, setWishlist]   = useState([]);
  const [filters, setFilters]     = useState({ category: '', search: '', sort: 'date', isFree: null });

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    try { const data = await api.get(EP.EVENTS.LIST, { params }); setEvents(data.events || data); }
    catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  const toggleWishlist = async (eventId) => {
    const inList = wishlist.includes(eventId);
    setWishlist(prev => inList ? prev.filter(id => id !== eventId) : [...prev, eventId]);
    try { await api.post(EP.EVENTS.WISHLIST(eventId)); }
    catch { setWishlist(prev => inList ? [...prev, eventId] : prev.filter(id => id !== eventId)); }
    toast.success(inList ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const registerEvent = async (eventId) => {
    const data = await api.post(EP.EVENTS.REGISTER(eventId));
    toast.success('Successfully registered!');
    return data;
  };

  return (
    <EventContext.Provider value={{ events, loading, wishlist, filters, setFilters, fetchEvents, toggleWishlist, registerEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEventCtx = () => useContext(EventContext);
