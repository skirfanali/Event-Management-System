import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';
import toast from 'react-hot-toast';

export function useEvents(params = {}) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await eventService.getAll(params); setEvents(d.events || d || []); }
    catch (e) { setError(e); toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { events, loading, error, refetch: fetch };
}

export function useEvent(id) {
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    eventService.getById(id)
      .then(setEvent)
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { event, loading };
}
