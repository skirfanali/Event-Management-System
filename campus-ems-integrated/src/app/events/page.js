'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventCard from '@/components/event/EventCard';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { eventService } from '@/services/eventService';
import { categoryService } from '@/services/categoryService';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const SORT_OPTIONS = [
  { value: 'eventDate,asc',  label: 'Date: Soonest' },
  { value: 'eventDate,desc', label: 'Date: Latest' },
  { value: 'registeredCount,desc', label: 'Most Popular' },
  { value: 'price,asc',      label: 'Price: Low to High' },
  { value: 'price,desc',     label: 'Price: High to Low' },
];

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [events,      setEvents]      = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [page,        setPage]        = useState(0);
  const [search,      setSearch]      = useState(searchParams.get('search') || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || '');
  const [sort,        setSort]        = useState('eventDate,asc');
  const [isFree,      setIsFree]      = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortDir] = sort.split(',');
      const params = { page, size: 9, sortBy, sortDir };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (isFree !== null) params.isFree = isFree;

      const data = await eventService.search(params);
      setEvents(data?.content || data || []);
      setTotalPages(data?.totalPages || 1);
      setTotalItems(data?.totalElements || 0);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort, isFree]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const clearFilters = () => { setCategory(''); setIsFree(null); setSearch(''); setPage(0); };
  const activeFilters = [category, isFree !== null ? (isFree ? 'Free' : 'Paid') : null].filter(Boolean);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2" style={{ color:'var(--text-primary)' }}>All Events</h1>
          <p className="text-sm" style={{ color:'var(--text-muted)' }}>{totalItems} events found</p>
        </motion.div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <SearchBar className="flex-1 min-w-48" placeholder="Search events…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}
            className="input-field w-auto px-4 text-sm cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="secondary" onClick={() => setShowFilters(v => !v)} className="flex items-center gap-2">
            <SlidersHorizontal size={15} /> Filters
            {activeFilters.length > 0 && <Badge variant="brand">{activeFilters.length}</Badge>}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }}
            className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Filters</h3>
              <button onClick={clearFilters} className="text-xs text-brand-500 hover:underline flex items-center gap-1"><X size={12}/>Clear All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--text-muted)' }}>CATEGORY</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} onClick={() => { setCategory(category === c.name ? '' : c.name); setPage(0); }}
                      className={`badge cursor-pointer transition-all ${category === c.name ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--text-muted)' }}>PRICE</p>
                <div className="flex gap-2">
                  {[{label:'All',value:null},{label:'Free',value:true},{label:'Paid',value:false}].map(o => (
                    <button key={o.label} onClick={() => { setIsFree(o.value); setPage(0); }}
                      className={`badge cursor-pointer transition-all ${isFree === o.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map(f => (
              <span key={f} className="badge bg-brand-500/10 text-brand-500 border border-brand-500/20">
                {f} <button onClick={clearFilters} className="ml-1"><X size={11}/></button>
              </span>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          : events.length === 0
            ? <EmptyState icon="🔍" title="No events found" description="Try adjusting your search or filters"
                action={<Button onClick={clearFilters}>Clear Filters</Button>} />
            : <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {events.map((ev,i) => <EventCard key={ev.id} event={ev} index={i}/>)}
                </div>
                <Pagination page={page+1} totalPages={totalPages}
                  onPageChange={p => { setPage(p-1); window.scrollTo(0,0); }}/>
              </>}
      </div>
      <Footer />
    </div>
  );
}
