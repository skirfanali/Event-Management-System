'use client';
import { useState, useEffect, useCallback } from 'react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EventManager from '@/components/organizer/EventManager';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/context/AuthContext';
import { organizerService } from '@/services/organizerService';
import { eventService } from '@/services/eventService';
import toast from 'react-hot-toast';

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizerService.getEvents({ page, size:10 });
      setEvents(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (eventId) => {
    try {
      await eventService.delete(eventId);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) { toast.error(err?.message || 'Delete failed'); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="My Events"/>
        {loading ? <Loader/> : (
          <>
            <EventManager events={events} onDelete={handleDelete}/>
            <Pagination page={page+1} totalPages={totalPages} onPageChange={p=>setPage(p-1)}/>
          </>
        )}
      </div>
    </div>
  );
}
