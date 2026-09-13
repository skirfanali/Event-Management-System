'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Star, ChevronDown, Check, Mail } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventCard from '@/components/event/EventCard';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { eventService } from '@/services/eventService';
import { categoryService } from '@/services/categoryService';
import { TESTIMONIALS, FAQS } from '@/data/mockData';

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { color:'rgba(99,102,241,0.2)',  size:400, x:30,  y:-20, dur:8  },
          { color:'rgba(244,63,94,0.15)', size:320, x:-40, y:30,  dur:10 },
          { color:'rgba(139,92,246,0.1)', size:260, x:0,   y:0,   dur:7  },
        ].map((b,i) => (
          <motion.div key={i}
            animate={{ scale:[1,1.2,1], x:[0,b.x,0], y:[0,b.y,0] }}
            transition={{ duration:b.dur, repeat:Infinity, ease:'easeInOut', delay:i*2 }}
            className="absolute rounded-full blur-3xl"
            style={{ width:b.size, height:b.size, background:`radial-gradient(circle, ${b.color}, transparent)`,
              top:`${20+i*25}%`, left:`${15+i*30}%` }}/>
        ))}
      </div>
      <div className="relative max-w-5xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border mb-8 text-sm font-medium"
          style={{ borderColor:'var(--border)', color:'var(--text-secondary)' }}>
          <motion.span animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:'linear' }}>✨</motion.span>
          Next-gen Campus Event Management
        </motion.div>
        <motion.h1 initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
          <span style={{ color:'var(--text-primary)' }}>Discover & Experience</span><br/>
          <span className="gradient-text">Campus Events</span><br/>
          <span style={{ color:'var(--text-primary)' }}>Like Never Before</span>
        </motion.h1>
        <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.35 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color:'var(--text-secondary)' }}>
          Register for events, download QR tickets, track attendance, and earn certificates — all in one beautiful platform.
        </motion.p>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link href="/events"><Button size="xl" className="flex items-center gap-2 shadow-glow">Explore Events <ArrowRight size={18}/></Button></Link>
          <Link href="/register"><Button variant="secondary" size="xl" className="flex items-center gap-2">Get Started Free</Button></Link>
        </motion.div>
        <motion.div initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.65 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[['1,200+','Events Hosted'],['84K+','Students Registered'],['50+','Colleges'],['98%','Satisfaction Rate']].map(([v,l])=>(
            <motion.div key={l} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl font-display font-bold gradient-text">{v}</p>
              <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{l}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <p className="text-xs" style={{ color:'var(--text-muted)' }}>Scroll to explore</p>
        <ChevronDown size={16} style={{ color:'var(--text-muted)' }}/>
      </motion.div>
    </section>
  );
}

// ── Categories ─────────────────────────────────────────────────────────────────
function Categories({ categories }) {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-12">
        <h2 className="section-title mb-3" style={{ color:'var(--text-primary)' }}>Browse by Category</h2>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat,i) => (
          <motion.div key={cat.id} initial={{ opacity:0,scale:0.8 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.05 }} whileHover={{ scale:1.08,y:-4 }}>
            <Link href={`/events?category=${cat.name}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover:shadow-lg cursor-pointer"
              style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
              <span className="text-3xl">{cat.icon||'📌'}</span>
              <span className="text-xs font-semibold" style={{ color:'var(--text-secondary)' }}>{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Events Section ─────────────────────────────────────────────────────────────
function EventsSection({ title, accent, events, loading, viewAllLink }) {
  return (
    <section className="py-20" style={{ background:'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color:accent }}><Zap size={14}/>{title}</p>
            <h2 className="section-title" style={{ color:'var(--text-primary)' }}>{title === 'Featured Events' ? "Don't Miss Out" : 'Most Popular'}</h2>
          </div>
          <Link href={viewAllLink}><Button variant="secondary" className="flex items-center gap-2">View All <ArrowRight size={15}/></Button></Link>
        </div>
        {loading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array(3).fill(0).map((_,i)=><SkeletonCard key={i}/>)}</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev,i) => <EventCard key={ev.id} event={ev} index={i}/>)}
            </div>}
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
        <h2 className="section-title mb-3" style={{ color:'var(--text-primary)' }}>Loved by Campus Communities</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t,i) => (
          <motion.div key={t.id} initial={{ opacity:0,y:25 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.12 }}
            className="p-6 rounded-2xl" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
            <div className="flex items-center gap-1 mb-4">{Array(t.rating).fill(0).map((_,j)=><Star key={j} size={14} className="fill-yellow-400 text-yellow-400"/>)}</div>
            <p className="text-sm leading-relaxed mb-5" style={{ color:'var(--text-secondary)' }}>"{t.text}"</p>
            <div className="flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full"/>
              <div>
                <p className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{t.name}</p>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-20" style={{ background:'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <h2 className="section-title mb-3" style={{ color:'var(--text-primary)' }}>Frequently Asked</h2>
        </motion.div>
        <div className="space-y-3">
          {FAQS.map((faq,i) => (
            <motion.div key={i} initial={{ opacity:0,y:15 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
              className="rounded-2xl overflow-hidden" style={{ background:'var(--bg-tertiary)', border:'1px solid var(--border)' }}>
              <button onClick={()=>setOpen(open===i?null:i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm" style={{ color:'var(--text-primary)' }}>
                {faq.q}
                <motion.span animate={{ rotate:open===i?45:0 }} className="text-xl flex-shrink-0 ml-4 text-brand-500">+</motion.span>
              </button>
              <motion.div initial={false} animate={{ height:open===i?'auto':0, opacity:open===i?1:0 }} transition={{ duration:0.25 }} className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color:'var(--text-muted)' }}>{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter ─────────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted]= useState(false);
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity:0,scale:0.95 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }}
        className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(244,63,94,0.1) 100%)', border:'1px solid rgba(99,102,241,0.25)' }}>
        <span className="text-5xl block mb-4">📬</span>
        <h2 className="section-title mb-3" style={{ color:'var(--text-primary)' }}>Stay in the Loop</h2>
        <p className="text-base mb-8 max-w-md mx-auto" style={{ color:'var(--text-muted)' }}>Get notified about upcoming events and early bird registrations.</p>
        {submitted
          ? <motion.div initial={{ scale:0.8 }} animate={{ scale:1 }} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-500 font-semibold">
              <Check size={18}/> You're subscribed! 🎉
            </motion.div>
          : <form onSubmit={e=>{e.preventDefault();if(email)setSubmitted(true);}} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required className="input-field pl-10"/>
              </div>
              <Button type="submit">Subscribe</Button>
            </form>}
      </motion.div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featured,   setFeatured]   = useState([]);
  const [trending,   setTrending]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingF,   setLoadingF]   = useState(true);
  const [loadingT,   setLoadingT]   = useState(true);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(()=>{});
    eventService.getFeatured().then(d=>{setFeatured(Array.isArray(d)?d:d?.content||[]);}).catch(()=>{}).finally(()=>setLoadingF(false));
    eventService.getTrending().then(d=>{setTrending(Array.isArray(d)?d:d?.content||[]);}).catch(()=>{}).finally(()=>setLoadingT(false));
  }, []);

  return (
    <main>
      <Navbar/>
      <Hero/>
      {categories.length > 0 && <Categories categories={categories}/>}
      <EventsSection title="Featured Events" accent="#6366f1" events={featured} loading={loadingF} viewAllLink="/events"/>
      <EventsSection title="Trending Events" accent="#f43f5e" events={trending} loading={loadingT} viewAllLink="/events?sort=trending"/>
      <Testimonials/>
      <FAQ/>
      <Newsletter/>
      <Footer/>
    </main>
  );
}
