import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Star, 
  Heart, 
  Send, 
  ShieldCheck, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Camera, 
  Phone, 
  Trash2, 
  Eye, 
  ShoppingBag, 
  Layers,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { 
  PLACEHOLDER_CUSTOMER_BOOKINGS, 
  PLACEHOLDER_WORKERS, 
  PLACEHOLDER_WORKER_POSTS 
} from '../data/mockData';
import { Booking, WorkerPost, WorkerProfile } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { authService, bookingService, workerService } from '../services/api';
import { postService } from '../services/postService';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { CustomerAiAgent } from '../components/customer/CustomerAiAgent';

export const CustomerDashboard: React.FC = () => {
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [storedUser, setStoredUser] = useState(() => authService.getStoredUser());

  const handleSignOut = () => {
    authService.logout();
    setStoredUser(null);
    navigate('/');
  };

  useEffect(() => {
    const handleAuthChange = () => setStoredUser(authService.getStoredUser());
    window.addEventListener('tegagn_auth_changed', handleAuthChange);
    return () => window.removeEventListener('tegagn_auth_changed', handleAuthChange);
  }, []);

  const customerDisplayName = storedUser?.firstName
    ? `${storedUser.firstName}${storedUser.lastName ? ` ${storedUser.lastName}` : ''}`.trim()
    : storedUser?.email
      ? storedUser.email.split('@')[0]
      : 'Customer';

  // Navigation Tabs: Default to 'marketplace' matching reference
  const location = useLocation();
  const tabQuery = searchParams.get('tab');
  const isAiPath = location.pathname.endsWith('/ai');
  const getInitialTab = (): 'marketplace' | 'bookings' | 'feed' | 'ai' => {
    if (tabQuery === 'ai' || isAiPath) return 'ai';
    if (tabQuery === 'feed') return 'feed';
    if (tabQuery === 'rate' || tabQuery === 'bookings' || tabQuery === 'cart') return 'bookings';
    return 'marketplace';
  };
  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'bookings' | 'feed' | 'ai'>(getInitialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'ai' || location.pathname.endsWith('/ai')) setSelectedTab('ai');
    else if (tab === 'feed') setSelectedTab('feed');
    else if (tab === 'rate' || tab === 'bookings' || tab === 'cart') setSelectedTab('bookings');
    else if (tab === 'marketplace') setSelectedTab('marketplace');
  }, [searchParams, location.pathname]);

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>(PLACEHOLDER_CUSTOMER_BOOKINGS);

  useEffect(() => {
    const loadBookings = () => {
      bookingService.getCustomerBookings().then(setBookings);
    };
    loadBookings();
    window.addEventListener('tegagn_bookings_changed', loadBookings);
    return () => window.removeEventListener('tegagn_bookings_changed', loadBookings);
  }, []);

  // Worker Posts Showcase State
  const [workerPosts, setWorkerPosts] = useState<WorkerPost[]>(() => postService.getApprovedPosts());

  useEffect(() => {
    const handlePostsChange = () => setWorkerPosts(postService.getApprovedPosts());
    window.addEventListener('tegagn_posts_changed', handlePostsChange);
    return () => window.removeEventListener('tegagn_posts_changed', handlePostsChange);
  }, []);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-101': true,
    'post-102': true
  });

  // Marketplace State
  const [workersList, setWorkersList] = useState<WorkerProfile[]>(PLACEHOLDER_WORKERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load workers including real registered database workers
  useEffect(() => {
    workerService.getWorkers().then((data) => {
      if (data && data.length > 0) {
        setWorkersList(data);
      }
    });
  }, []);

  // Booking Modal State (with GPS location & problem photos)
  const [bookingModalWorker, setBookingModalWorker] = useState<WorkerProfile | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    serviceTitle: '',
    date: '2026-10-30',
    timeSlot: '10:00 AM - 12:00 PM',
    address: 'Bole Atlas, Addis Ababa',
    lat: 9.0084,
    lng: 38.7891,
    gpsDetected: true,
    images: [] as string[]
  });
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState(false);

  // Photo Uploader Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setBookingFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setBookingFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Review & Rating Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Handle Like Reaction on Worker Post
  const handleLikePost = (postId: string) => {
    postService.toggleLike(postId);
  };

  // Handle Adding Comment on Worker Post
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const newComment = {
      id: `c-${Date.now()}`,
      postId,
      authorName: customerDisplayName,
      authorAvatar: storedUser?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      comment: commentText,
      createdAt: 'Just now'
    };

    postService.addComment(postId, newComment);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  // Detect GPS Location
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBookingFormData(prev => ({
            ...prev,
            lat: parseFloat(position.coords.latitude.toFixed(4)),
            lng: parseFloat(position.coords.longitude.toFixed(4)),
            gpsDetected: true
          }));
        },
        () => {
          setBookingFormData(prev => ({
            ...prev,
            lat: 9.0084,
            lng: 38.7891,
            gpsDetected: true
          }));
        }
      );
    }
  };

  // Submit New Booking
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalWorker) return;

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      customerId: storedUser?.id || 'cust-1',
      customerName: customerDisplayName,
      customerPhone: storedUser?.phoneNumber || '+251 91 123 4567',
      workerId: bookingModalWorker.id,
      workerName: `${bookingModalWorker.user.firstName} ${bookingModalWorker.user.lastName}`,
      workerTrade: bookingModalWorker.tradeTitle,
      serviceDescription: bookingFormData.serviceTitle || `Service Call with ${bookingModalWorker.user.firstName}`,
      scheduledDate: bookingFormData.date,
      scheduledTime: bookingFormData.timeSlot,
      location: bookingFormData.address,
      gpsCoordinates: {
        lat: bookingFormData.lat,
        lng: bookingFormData.lng,
        label: bookingFormData.address
      },
      images: bookingFormData.images,
      status: 'pending',
      estimatedCost: bookingModalWorker.hourlyRate * 2,
      createdAt: new Date().toISOString()
    };

    bookingService.createBooking(newBooking);
    setBookingSuccessNotice(true);
    setTimeout(() => {
      setBookingSuccessNotice(false);
      setBookingModalWorker(null);
      setSelectedTab('bookings');
    }, 1000);
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    bookingService.updateBookingStatus(bookingId, 'cancelled');
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  // Submit Review & Rating for Worker
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewModalBooking(null);
      setReviewSubmitted(false);
      setReviewComment('');
    }, 1500);
  };

  // Filter workers by search and category
  const filteredWorkers = workersList.filter((w) => {
    const matchesCategory = selectedCategory === 'all' || w.trade.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !query ||
      w.user.firstName.toLowerCase().includes(query) ||
      w.user.lastName.toLowerCase().includes(query) ||
      w.tradeTitle.toLowerCase().includes(query) ||
      w.skills.some(s => s.toLowerCase().includes(query)) ||
      w.city.toLowerCase().includes(query) ||
      w.bio.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Trade category pills (matching EthioAgriConnect's horizontal pill selector)
  const categoryPills = [
    { slug: 'all', label: 'All' },
    { slug: 'plumber', label: 'Plumbing' },
    { slug: 'electrician', label: 'Electrical' },
    { slug: 'carpenter', label: 'Carpentry' },
    { slug: 'painter', label: 'Painting' },
    { slug: 'builder', label: 'Masonry' },
    { slug: 'cleaning', label: 'Cleaning' },
  ];

  // High-resolution trade cover imagery (matching marketplace produce cards)
  const getTradeCoverImage = (trade: string, fallbackAvatar?: string) => {
    const t = trade.toLowerCase();
    if (t.includes('plumb')) return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600';
    if (t.includes('electr')) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600';
    if (t.includes('carpent') || t.includes('wood')) return 'https://images.unsplash.com/photo-1502005229762-ee1b2b814a79?auto=format&fit=crop&q=80&w=600';
    if (t.includes('paint')) return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600';
    if (t.includes('clean')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
    if (t.includes('build') || t.includes('mason')) return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600';
    return fallbackAvatar || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600';
  };

  // Active bookings calculation
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const totalCartCost = activeBookings.reduce((sum, b) => sum + (b.estimatedCost || 350), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* 1. TOP SUB-NAV BAR (Inspired by Screenshot 1 Header: Marketplace | Cart | Orders | Profile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setSelectedTab('marketplace'); setSearchParams({ tab: 'marketplace' }); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              selectedTab === 'marketplace'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedTab('bookings'); setSearchParams({ tab: 'bookings' }); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              selectedTab === 'bookings'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Requests (Cart)</span>
            {activeBookings.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === 'bookings' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}>
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setSelectedTab('feed'); setSearchParams({ tab: 'feed' }); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              selectedTab === 'feed'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Showcase Feed</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTab('ai');
              setSearchParams({ tab: 'ai' });
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              selectedTab === 'ai'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Features</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-black ${
              selectedTab === 'ai'
                ? 'bg-slate-950 text-amber-400'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              Gemini
            </span>
          </button>
        </div>

        {/* User Pill Badge on Right (matching '👤 Mati Israel') + Sign Out */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>👤 {customerDisplayName}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* 2. TAB 1: MARKETPLACE (Matching Screenshot 1 Layout with Warm Amber Accent) */}
      {selectedTab === 'marketplace' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect with verified independent trade professionals directly without markups.
            </p>
          </div>

          {/* Search Bar with AI Search Button (matching reference) */}
          <div className="relative flex items-center max-w-4xl">
            <Search className="w-5 h-5 text-amber-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or trade specialists... (try: 'pipe repair' or 'circuit breaker')"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <div className="absolute right-2 flex items-center">
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Search
              </span>
            </div>
          </div>

          {/* Quick Horizontal Category Pills (matching reference) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categoryPills.map((c) => {
              const isSelected = selectedCategory === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-amber-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* 3-Column Card Grid (Matching Screenshot 1) */}
          {filteredWorkers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No technicians found matching your criteria</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Reset Search & Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((worker) => {
                const coverImage = getTradeCoverImage(worker.trade, worker.user.avatarUrl);
                return (
                  <div 
                    key={worker.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Cover Image (Matching Screenshot 1 product images) */}
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img 
                          src={coverImage} 
                          alt={worker.tradeTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                            {worker.trade}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-amber-500 font-bold text-xs shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{worker.rating}</span>
                        </div>
                      </div>

                      {/* Card Content Area */}
                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                              {worker.user.firstName} {worker.user.lastName}
                            </h3>
                            {worker.isVerified && (
                              <span title="Verified Professional">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            by {worker.tradeTitle} • {worker.city}
                          </p>
                        </div>

                        {/* Bio snippet */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {worker.bio || `Specialist in residential ${worker.trade} repairs and installations.`}
                        </p>

                        {/* Availability Meta */}
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Available: <strong className="text-emerald-600 dark:text-emerald-400">Available Now</strong> • {worker.experienceYears} yrs exp
                        </div>

                        {/* Price (Large & Warm Amber) */}
                        <div className="pt-2 text-xl font-black text-amber-600 dark:text-amber-400">
                          {worker.hourlyRate} ETB<span className="text-xs font-bold text-slate-500">/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons (Matching Screenshot 1: View Details & Add to Cart/Book) */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                      <Link
                        to={`/workers/${worker.id}`}
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setBookingModalWorker(worker);
                          setBookingFormData(prev => ({
                            ...prev,
                            serviceTitle: `Standard Service Call with ${worker.user.firstName}`
                          }));
                        }}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                        <span>Book Pro</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 3. TAB 2: MY REQUESTS & SHOPPING CART (Matching Screenshot 2: 2-Column Layout with Order Summary) */}
      {selectedTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8 cols): Shopping Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Shopping Cart & Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Review and manage your pending service bookings and technician appointments.
                </p>
              </div>

              {activeBookings.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300">Your requests list is empty</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse the marketplace to select from verified plumbing, electrical, and home repair professionals.
                  </p>
                  <Button
                    variant="accent"
                    size="md"
                    onClick={() => { setSelectedTab('marketplace'); setSearchParams({ tab: 'marketplace' }); }}
                  >
                    Browse Marketplace
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((b) => (
                    <div 
                      key={b.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail and Details (matching Screenshot 2 item layout) */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img 
                            src={getTradeCoverImage(b.workerTrade)} 
                            alt={b.workerName}
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            {b.workerName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            by {b.workerTrade}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>📅 {b.scheduledDate}</span>
                            <span>•</span>
                            <span>⏰ {b.scheduledTime}</span>
                          </div>
                          <div className="pt-0.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : b.status === 'accepted'
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {b.status === 'accepted' ? 'Confirmed' : b.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Delete Trash Icon (matching Screenshot 2) */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                            {b.estimatedCost || 350} ETB
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (4 cols): Order Summary Card (Matching Screenshot 2) */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-24">
                
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Services ({activeBookings.length})</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{totalCartCost} ETB</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Direct Connection Fee</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {totalCartCost} ETB
                    </span>
                  </div>
                </div>

                {/* Two Action Buttons (matching Screenshot 2: Proceed to Checkout & Continue Shopping) */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedTab('marketplace'); setSearchParams({ tab: 'marketplace' }); }}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 text-center transition-all cursor-pointer"
                  >
                    Proceed to Book More Trades
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedTab('marketplace'); setSearchParams({ tab: 'marketplace' }); }}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs text-center transition-colors cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. TAB 3: SHOWCASE FEED */}
      {selectedTab === 'feed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Work Showcase Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore recent home repair transformations and project photos verified by Tegagn administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workerPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all dark:bg-slate-900">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.workerAvatar}
                      alt={post.workerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{post.workerName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{post.workerTrade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {post.workerHourlyRate || 350} ETB/hr
                    </span>
                  </div>
                </div>

                <div className="relative h-64 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {post.location}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 text-rose-500 font-bold hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                      <span>{post.likesCount}</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 4: AI FEATURES (Powered by Google Gemini API) */}
      {selectedTab === 'ai' && (
        <CustomerAiAgent
          customerName={customerDisplayName}
          onNavigateTab={(tab) => {
            setSelectedTab(tab);
            setSearchParams({ tab });
          }}
        />
      )}

      {/* 5. MODAL: BOOK TECHNICIAN (With Warm Amber Accents) */}
      {bookingModalWorker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Book Technician • {bookingModalWorker.user.firstName}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setBookingModalWorker(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingSuccessNotice && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Service request booked! Added to your requests list.</span>
              </div>
            )}

            {/* Worker summary strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {bookingModalWorker.user.firstName} {bookingModalWorker.user.lastName}
                </span>
                <span className="text-slate-500 dark:text-slate-400">{bookingModalWorker.tradeTitle}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block text-sm">
                  {bookingModalWorker.hourlyRate} ETB/hr
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Describe Service or Repair Needed
                </label>
                <input
                  type="text"
                  value={bookingFormData.serviceTitle}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, serviceTitle: e.target.value })}
                  placeholder="e.g. Water pipe leaking under sink, light fixture install..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.date}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={bookingFormData.timeSlot}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="08:00 AM - 10:00 AM">Morning (08:00 AM - 10:00 AM)</option>
                    <option value="10:00 AM - 12:00 PM">Midday (10:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Location / Neighborhood
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookingFormData.address}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, address: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  Confirm & Dispatch Request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
