'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, Users, DollarSign, Upload, ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { eventService } from '@/services/eventService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Details', 'Pricing', 'Review'];

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step,         setStep]         = useState(0);
  const [isFree,       setIsFree]       = useState(true);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile,    setCoverFile]    = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'USER') {
      toast.error('Only organizers can create events');
      router.push('/dashboard');
      return;
    }
    categoryService.getAll().then(setCategories).catch(() => {});
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: { isFree: true, price: 0, capacity: 100 },
  });

  const formData = watch();

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Navigate FORWARD — validates current step fields only, NEVER submits form
  const handleNext = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fieldGroups = [
      ['title', 'description', 'categoryId'],
      ['eventDate', 'venue'],
      ['capacity'],
      [],
    ];
    const valid = await trigger(fieldGroups[step] || []);
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  // Navigate BACKWARD — never submits
  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStep(s => Math.max(s - 1, 0));
  };

  // Only fires when type="submit" button clicked on step 3
  const onSubmit = async (data) => {
    if (step !== STEPS.length - 1) return; // extra safety guard
    setSubmitting(true);
    try {
      const payload = {
        title:        data.title,
        description:  data.description,
        categoryId:   Number(data.categoryId),
        eventDate:    new Date(data.eventDate + 'T' + (data.time || '09:00')).toISOString(),
        endDate:      data.endDate
                        ? new Date(data.endDate + 'T' + (data.endTime || '18:00')).toISOString()
                        : null,
        venue:        data.venue,
        venueAddress: data.venueAddress || '',
        city:         data.city || '',
        capacity:     Number(data.capacity),
        price:        isFree ? 0 : Number(data.price || 0),
        isFree,
        tags:         data.tags || '',
      };

      const created = await eventService.create(payload);

      if (coverFile && created?.id) {
        try { await eventService.uploadImage(created.id, coverFile); }
        catch { toast('Event created but image upload failed. Upload later.'); }
      }

      toast.success('Event published successfully! 🎉');
      router.push('/organizer/events');
    } catch (err) {
      toast.error(err?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 hover:text-brand-500 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Create New Event ✨
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Fill in the details to publish your event
          </p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-green-500 text-white' : i === step ? 'gradient-bg text-white' : ''
                  }`}
                  style={i > step ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' } : {}}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${i === step ? 'text-brand-500' : ''}`}
                  style={i !== step ? { color: 'var(--text-muted)' } : {}}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px mx-1"
                    style={{ background: i < step ? '#22c55e' : 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="card p-6 space-y-5">

              {/* ── Step 0: Basic Info ─────────────────────────────────────── */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <Input label="Event Title *" placeholder="e.g. TechFest 2025 – Annual Hackathon"
                    error={errors.title?.message}
                    {...register('title', { required: 'Title is required' })} />

                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Description *</label>
                    <textarea rows={5} placeholder="Describe your event in detail…"
                      className="input-field resize-none"
                      {...register('description', { required: 'Description is required' })} />
                    {errors.description && <p className="text-xs text-red-500 mt-1">⚠ {errors.description.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Category *</label>
                    <select className="input-field" {...register('categoryId', { required: 'Category is required' })}>
                      <option value="">Select category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon || '📌'} {c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-xs text-red-500 mt-1">⚠ {errors.categoryId.message}</p>}
                  </div>

                  {/* Cover Image — fixed: object-cover fills box correctly */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Cover Image</label>
                    <label
                      className="relative flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed cursor-pointer hover:border-brand-500 transition-colors overflow-hidden"
                      style={{ borderColor: coverPreview ? 'var(--border)' : 'var(--border)' }}>
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="Cover preview"
                            className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload size={22} className="text-white mb-1" />
                            <p className="text-xs text-white font-medium">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <Upload size={28} className="mx-auto mb-2 text-brand-500" />
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Drop image or click to upload
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            PNG, JPG up to 10MB · recommended 1200×500px
                          </p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="sr-only" onChange={handleCover} />
                    </label>
                    {coverFile && (
                      <p className="text-xs mt-1.5 text-green-500 flex items-center gap-1">
                        <Check size={12} /> {coverFile.name} ({(coverFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Details ────────────────────────────────────────── */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Event Date *" type="date" icon={<Calendar size={16} />}
                      error={errors.eventDate?.message}
                      {...register('eventDate', { required: 'Date is required' })} />
                    <Input label="Start Time" type="time" {...register('time')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="End Date" type="date" {...register('endDate')} />
                    <Input label="End Time" type="time" {...register('endTime')} />
                  </div>
                  <Input label="Venue *" placeholder="e.g. Main Auditorium, Block A"
                    icon={<MapPin size={16} />} error={errors.venue?.message}
                    {...register('venue', { required: 'Venue is required' })} />
                  <Input label="Venue Address" placeholder="Full address" {...register('venueAddress')} />
                  <Input label="City" placeholder="e.g. Mumbai" {...register('city')} />
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Tags <span style={{ color: 'var(--text-muted)' }}>(comma separated)</span>
                    </label>
                    <input placeholder="coding, hackathon, prizes" className="input-field" {...register('tags')} />
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Pricing ────────────────────────────────────────── */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <Input label="Capacity (max attendees) *" type="number" placeholder="100"
                    icon={<Users size={16} />} error={errors.capacity?.message}
                    {...register('capacity', {
                      required: 'Capacity is required',
                      min: { value: 1, message: 'At least 1 attendee required' },
                    })} />
                  <div>
                    <label className="text-sm font-medium block mb-3" style={{ color: 'var(--text-secondary)' }}>Pricing</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[{ label: '🎟 Free Event', value: true }, { label: '💳 Paid Event', value: false }].map(o => (
                        <button
                          key={String(o.value)}
                          type="button"
                          onClick={() => setIsFree(o.value)}
                          className="p-4 rounded-2xl border-2 text-sm font-semibold transition-all"
                          style={{
                            borderColor: isFree === o.value ? '#6366f1' : 'var(--border)',
                            color: 'var(--text-primary)',
                            background: isFree === o.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                          }}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {!isFree && (
                      <Input label="Ticket Price (₹) *" type="number" placeholder="299"
                        icon={<DollarSign size={16} />}
                        {...register('price', {
                          required: !isFree ? 'Price is required for paid events' : false,
                          min: { value: 1, message: 'Price must be greater than 0' },
                        })} />
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review ─────────────────────────────────────────── */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h3 className="font-bold font-display text-base" style={{ color: 'var(--text-primary)' }}>
                    Review Your Event
                  </h3>
                  {coverPreview && (
                    <div className="relative h-48 rounded-2xl overflow-hidden">
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    {[
                      ['Title',    formData.title],
                      ['Category', categories.find(c => String(c.id) === String(formData.categoryId))?.name],
                      ['Date',     formData.eventDate],
                      ['Time',     formData.time || '09:00'],
                      ['Venue',    formData.venue],
                      ['City',     formData.city],
                      ['Capacity', formData.capacity ? `${formData.capacity} seats` : null],
                      ['Price',    isFree ? 'Free' : `₹${formData.price || 0}`],
                      ['Tags',     formData.tags],
                    ].filter(([, v]) => v).map(([k, v], i) => (
                      <div key={k}
                        className="flex justify-between items-center px-4 py-3 text-sm border-b last:border-b-0"
                        style={{
                          borderColor: 'var(--border)',
                          background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                        }}>
                        <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="font-semibold text-right max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Everything looks good! Click "Publish Event" to make it live.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation — all type="button" except the final submit */}
            <div className="flex items-center justify-between mt-6">
              <Button type="button" variant="secondary" onClick={handlePrev} disabled={step === 0}>
                Previous
              </Button>
              {step < STEPS.length - 1
                ? <Button type="button" onClick={handleNext}>Next Step</Button>
                : <Button type="submit" loading={submitting} size="lg">🚀 Publish Event</Button>}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}