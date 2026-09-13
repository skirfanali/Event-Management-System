'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Users, Share2, Heart, CalendarCheck, CheckCircle } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventBanner from '@/components/event/EventBanner';
import EventDetails from '@/components/event/EventDetails';
import ReviewCard from '@/components/event/ReviewCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import RatingStars from '@/components/event/RatingStars';
import PaymentSummary from '@/components/payment/PaymentSummary';
import CouponSection from '@/components/payment/CouponSection';
import RazorpayButton from '@/components/payment/RazorpayButton';
import { eventService } from '@/services/eventService';
import { reviewService } from '@/services/reviewService';
import { registrationService } from '@/services/registrationService';
import { wishlistService } from '@/services/wishlistService';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, copyToClipboard } from '@/lib/helpers';
import { couponStore } from '@/lib/registrationStore';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const { user } = useAuth();

  const [event,         setEvent]        = useState(null);
  const [reviews,       setReviews]      = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [registered,    setRegistered]   = useState(false);
  const [wishlisted,    setWishlisted]   = useState(false);
  const [registerModal, setRegisterModal]= useState(false);
  const [reviewModal,   setReviewModal]  = useState(false);
  const [processing,    setProcessing]   = useState(false);

  // Coupon state
  const [couponCode,    setCouponCode]   = useState('');
  const [coupon,        setCoupon]       = useState(null);
  const [couponError,   setCouponError]  = useState('');
  const [couponLoading, setCouponLoading]= useState(false);

  // Review state
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [ev, rv] = await Promise.all([
          eventService.getById(id),
          reviewService.getByEvent(id, { page: 0, size: 5 }),
        ]);
        setEvent(ev);
        setReviews(rv?.content || rv || []);
        setWishlisted(ev?.wishlisted || false);
        setRegistered(ev?.registeredByCurrentUser || false);
      } catch { toast.error('Failed to load event'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const summary = (() => {
    const price    = Number(event?.price) || 0;
    const tax      = price > 0 ? Math.round(price * 0.05) : 0;
    const discount = coupon ? (coupon.type === 'PERCENT'
      ? Math.min(price, Math.round((price * coupon.value) / 100))
      : Math.min(price, coupon.value)) : 0;
    return { price, tax, subtotal: price + tax, discount, total: Math.max(0, price + tax - discount) };
  })();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const api = (await import('@/lib/axios')).default;
      const EP  = (await import('@/lib/endpoints')).default;
      const res = await api.get(EP.COUPONS.VALIDATE, { params: { code: couponCode, amount: event.price } });
      if (res?.valid) { setCoupon(res); toast.success(`Coupon "${res.code}" applied!`); }
      else { setCouponError(res?.message || 'Invalid coupon'); setCoupon(null); }
    } catch { setCouponError('Invalid coupon code'); } 
    finally { setCouponLoading(false); }
  };

  const handleRegister = async () => {
    if (!user) { toast.error('Please login to register'); router.push('/login'); return; }
    if (registered) { router.push('/dashboard/tickets'); return; }
    setRegisterModal(true);
  };

  const handlePayment = async () => {
    setRegisterModal(false);
    setProcessing(true);
    try {
      // Step 1: Create registration (PENDING for paid, ACTIVE for free)
      const reg = await registrationService.register(event.id, coupon?.code || null);
      if (!reg?.id) throw new Error('Registration failed — no ID returned');

      // ✅ FIX: Use event.isFree from backend — NOT summary.total (frontend calc can be wrong)
      // summary.total being 0 due to coupon or tax rounding must NOT bypass Razorpay
      if (event.isFree) {
        // Free event — backend already confirmed registration + ticket
        toast.success('Successfully registered! Ticket generated 🎫');
        setRegistered(true);
        sessionStorage.setItem('ems_last_payment', JSON.stringify({ registration: reg, event }));
        router.push('/payment/success');
        return;
      }

      // ✅ Step 3: Paid event — always go through Razorpay
      await paymentService.initiatePayment({
        registration: reg,
        user,
        onSuccess: (paymentData) => {
          toast.success('Payment successful! Ticket is ready 🎫');
          sessionStorage.setItem('ems_last_payment', JSON.stringify({ registration: reg, payment: paymentData, event }));
          setRegistered(true);
          router.push('/payment/success');
        },
        onFailure: (msg) => {
          toast.error(msg || 'Payment failed');
          sessionStorage.setItem('ems_payment_error', msg || 'Payment failed');
          router.push('/payment/failure');
        },
        onDismiss: () => {
          toast('Payment cancelled');
          setProcessing(false);
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await wishlistService.toggle(event.id);
      setWishlisted(v => !v);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleShare = async () => {
    if (await copyToClipboard(window.location.href)) toast.success('Link copied!');
  };

  const handleReview = async () => {
    if (!rating)           return toast.error('Please select a rating');
    if (comment.length < 10) return toast.error('Comment too short');
    try {
      const r = await reviewService.add(event.id, { rating, comment });
      setReviews(prev => [r, ...prev]);
      setEvent(prev => ({ ...prev, reviewCount: (prev.reviewCount || 0) + 1 }));
      toast.success('Review submitted!');
      setReviewModal(false); setRating(0); setComment('');
    } catch (err) { toast.error(err?.message || 'Failed to submit review'); }
  };

  if (loading) return <Loader fullScreen />;
  if (!event)  return <div className="min-h-screen flex items-center justify-center"><p>Event not found</p></div>;

  const spotsLeft = (event.capacity || 0) - (event.registeredCount || 0);

  return (
    <div style={{ background:'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <EventBanner event={event} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <EventDetails event={event} />
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg" style={{ color:'var(--text-primary)' }}>Reviews ({event.reviewCount || reviews.length})</h2>
                {user && <Button size="sm" onClick={() => setReviewModal(true)}>Write Review</Button>}
              </div>
              <div className="space-y-4">
                {reviews.length === 0
                  ? <p className="text-sm text-center py-6" style={{ color:'var(--text-muted)' }}>No reviews yet. Be the first!</p>
                  : reviews.map((r,i) => <ReviewCard key={r.id} review={r} index={i}/>)}
              </div>
            </div>
          </div>

          <div>
            <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} className="card p-6 sticky top-24">
              <div className="mb-5">
                {event.isFree
                  ? <span className="text-3xl font-display font-bold text-green-500">FREE</span>
                  : <><span className="text-3xl font-display font-bold gradient-text">{formatCurrency(event.price)}</span><span className="text-sm ml-1" style={{ color:'var(--text-muted)' }}>/person</span></>}
                <div className="flex items-center gap-2 text-sm mt-1" style={{ color:'var(--text-muted)' }}>
                  <Star size={14} className="fill-yellow-400 text-yellow-400"/>
                  <span className="font-semibold" style={{ color:'var(--text-primary)' }}>{event.avgRating || '0.0'}</span>
                  <span>({event.reviewCount || 0} reviews)</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color:'var(--text-muted)' }}>{event.registeredCount || 0} registered</span>
                  <span style={{ color: spotsLeft < 20 ? '#f59e0b' : 'var(--text-muted)' }}>{spotsLeft} spots left</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--bg-tertiary)' }}>
                  <motion.div initial={{ width:0 }}
                    animate={{ width:`${Math.min(100, ((event.registeredCount||0)/(event.capacity||1))*100)}%` }}
                    transition={{ duration:0.8 }} className="h-full rounded-full gradient-bg"/>
                </div>
              </div>

              {registered
                ? <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <CheckCircle size={18} className="text-green-500"/>
                      <p className="text-sm font-semibold text-green-600">You're registered!</p>
                    </div>
                    <Button className="w-full" variant="secondary" onClick={() => router.push('/dashboard/tickets')}>
                      View My Ticket
                    </Button>
                  </div>
                : <Button className="w-full mb-3" size="lg" onClick={handleRegister}
                    disabled={spotsLeft === 0 || processing} loading={processing}>
                    <CalendarCheck size={17}/>
                    {spotsLeft === 0 ? 'Event Full' : event.isFree ? 'Register Free' : 'Register Now'}
                  </Button>}

              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="secondary" size="sm" onClick={handleWishlist}
                  className={`flex items-center justify-center gap-1.5 ${wishlisted ? 'text-accent-500 border-accent-500' : ''}`}>
                  <Heart size={14} className={wishlisted ? 'fill-accent-500' : ''}/>{wishlisted ? 'Saved' : 'Wishlist'}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleShare} className="flex items-center justify-center gap-1.5">
                  <Share2 size={14}/> Share
                </Button>
              </div>

              <div className="mt-5 pt-5 border-t space-y-3" style={{ borderColor:'var(--border)' }}>
                {[['Organizer',event.organizerName],['Category',event.category],['Capacity',`${event.capacity} seats`]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm">
                    <span style={{ color:'var(--text-muted)' }}>{k}</span>
                    <span className="font-medium" style={{ color:'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal open={registerModal} onClose={() => !processing && setRegisterModal(false)} title="Complete Registration" size="md">
        <div className="space-y-6">
          <PaymentSummary event={event} summary={summary}/>
          {!event.isFree && (
            <CouponSection couponCode={couponCode} setCouponCode={setCouponCode}
              coupon={coupon} couponError={couponError} couponLoading={couponLoading}
              onApply={applyCoupon} onRemove={() => { setCoupon(null); setCouponCode(''); setCouponError(''); }}/>
          )}
          <RazorpayButton summary={summary} processing={processing} onClick={handlePayment} disabled={spotsLeft === 0}/>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium mb-3" style={{ color:'var(--text-secondary)' }}>Your Rating</p>
            <RatingStars rating={rating} interactive onChange={setRating} size={28}/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-secondary)' }}>Your Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder="Share your experience…" className="input-field resize-none" maxLength={500}/>
            <p className="text-xs mt-1 text-right" style={{ color:'var(--text-muted)' }}>{comment.length}/500</p>
          </div>
          <Button className="w-full" onClick={handleReview}>Submit Review</Button>
        </div>
      </Modal>

      <Footer/>
    </div>
  );
}