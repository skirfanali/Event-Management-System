import { useState, useEffect } from 'react';
import { ticketService } from '@/services/ticketService';
import toast from 'react-hot-toast';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getAll()
      .then(d => setTickets(d.tickets || d || []))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  return { tickets, loading };
}
