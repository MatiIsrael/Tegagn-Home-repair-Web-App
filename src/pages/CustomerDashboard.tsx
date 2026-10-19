import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle, 
  Star,
  Heart,
  MessageSquare,
  Send,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Camera,
  Layers,
  Phone,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { 
  PLACEHOLDER_CUSTOMER_BOOKINGS, 
  PLACEHOLDER_WORKERS, 
  PLACEHOLDER_WORKER_POSTS 
} from '../data/mockData';
import { Booking, BookingStatus, WorkerPost, WorkerProfile } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { authService } from '../services/api';
import { postService } from '../services/postService';

export const CustomerDashboard: React.FC = () => {
  const [storedUser, setStoredUser] = useState(() => authService.getStoredUser());

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

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>(PLACEHOLDER_CUSTOMER_BOOKINGS);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'compare' | 'bookings'>('feed');

  // Worker Posts Showcase State: ONLY show posts approved by the platform admin!
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

  // Compare & Hire State
  const [workersList, setWorkersList] = useState<WorkerProfile[]>(PLACEHOLDER_WORKERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'price_asc' | 'experience_desc'>('rating_desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State (with GPS location detection)
  const [bookingModalWorker, setBookingModalWorker] = useState<WorkerProfile | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    serviceTitle: '',
    date: '2026-10-20',
    timeSlot: '10:00 AM - 12:00 PM',
    address: 'Bole Atlas, House #402, Addis Ababa',
    notes: '',
    lat: 9.0084,
    lng: 38.7891,
    gpsDetected: true
  });
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState(false);

  // Review & Rating Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Handle Like Reaction on Worker Post
  const handleToggleLike = (postId: string) => {
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
          // Fallback to Addis Ababa coordinates
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

  // Submit New Booking with GPS location
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
      serviceDescription: bookingFormData.serviceTitle || `Service with ${bookingModalWorker.user.firstName}`,
      scheduledDate: bookingFormData.date,
      scheduledTime: bookingFormData.timeSlot,
      location: bookingFormData.address,
      gpsCoordinates: {
        lat: bookingFormData.lat,
        lng: bookingFormData.lng,
        label: bookingFormData.address
      },
      status: 'pending',
      estimatedCost: bookingModalWorker.hourlyRate * 2,
      createdAt: new Date().toISOString(),
      notes: bookingFormData.notes
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccessNotice(true);
    setTimeout(() => {
      setBookingSuccessNotice(false);
      setBookingModalWorker(null);
      setSelectedTab('bookings');
    }, 1200);
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

  // Filter and compare workers
  const filteredWorkers = workersList
    .filter(w => {
      const matchesCategory = selectedCategory === 'all' || w.trade.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = 
        w.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tradeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        w.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'experience_desc') return b.experienceYears - a.experienceYears;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Customer Hub Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Homeowner Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {customerDisplayName} 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Browse recent repair projects from local technicians, check real photos & prices, read community reviews, and book trusted help for your home.
          </p>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          icon={<Plus className="w-5 h-5" />} 
          className="shadow-lg shadow-brand-500/20"
          onClick={() => setSelectedTab('compare')}
        >
          Find & Book a Pro
        </Button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Active Repair Bookings</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {workerPosts.reduce((acc, p) => acc + p.likesCount, 0)}
            </div>
            <div className="text-xs font-medium text-slate-500">Community Post Reactions</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{workersList.length} Verified Pros</div>
            <div className="text-xs font-medium text-slate-500">Ready to Book with GPS</div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 sm:space-x-10 overflow-x-auto pb-1">
          
          <button
            onClick={() => setSelectedTab('feed')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'feed'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Worker Posts & Community Reactions ({workerPosts.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('compare')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'compare'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Compare & Hire Professionals ({filteredWorkers.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('bookings')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'bookings'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Bookings & Rating ({bookings.length})</span>
          </button>

        </nav>
      </div>

      {/* TAB 1: WORKER POSTS & COMMUNITY REACTIONS (Like, Comment) */}
      {selectedTab === 'feed' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Real repair transformations posted by tradespeople. React with likes and inquiries, or book directly!</span>
            </div>
            <span className="font-bold text-brand-700 hidden sm:inline-block">Addis Ababa Community Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workerPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden p-0 border border-slate-200 shadow-md hover:shadow-xl transition-all">
                
                {/* Worker Author Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.workerAvatar}
                      alt={post.workerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{post.workerName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="text-xs text-slate-500">{post.workerTrade}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{post.workerRating || 4.9}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-brand-700">
                      {post.workerHourlyRate || 350} ETB/hr
                    </span>
                  </div>
                </div>

                {/* Photo Image */}
                <div className="relative h-64 bg-slate-100 overflow-hidden">
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
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-lg">
                      Cost: {post.priceCharged} {post.currency}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {post.location}
                    </span>
                    <span>Completed in: <strong>{post.duration}</strong></span>
                  </div>

                  {/* Reaction Buttons Bar: Like & Comment */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    
                    <div className="flex items-center gap-3">
                      {/* Like Reaction Button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          post.isLiked
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Comments</span>
                      </button>
                    </div>

                    {/* Book This Worker Button */}
                    <button
                      onClick={() => {
                        const targetWorker = workersList.find(w => w.id === post.workerId) || workersList[0];
                        setBookingModalWorker(targetWorker);
                        setBookingFormData(prev => ({
                          ...prev,
                          serviceTitle: `Hire for: ${post.title}`
                        }));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
                    >
                      Book Professional
                    </button>

                  </div>

                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      
                      {/* Comments Feed */}
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {post.comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No comments yet. Be the first to inquire!</p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{comment.authorName}</span>
                                <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                              </div>
                              <p className="text-slate-600">{comment.comment}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Form */}
                      <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Write a comment or ask about this repair..."
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white cursor-pointer shadow-sm"
                          title="Post Comment"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                    </div>
                  )}

                </div>

              </Card>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: COMPARE & HIRE PROFESSIONALS (Rate, Price, Experience, Photos, GPS) */}
      {selectedTab === 'compare' && (
        <div className="space-y-6">
          
          {/* Controls: Search, Trade Filter & Sorting */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Compare Verified Tradespeople</h2>
                <p className="text-xs text-slate-500">Filter by pricing, review rating, experience years, and portfolio photos.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="rating_desc">Highest Rated ★</option>
                  <option value="price_asc">Lowest Hourly Price</option>
                  <option value="experience_desc">Most Experienced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by worker name, trade title, skill (e.g. PPR pipes, wiring), or neighborhood..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">All Trade Categories</option>
                  <option value="plumber">Plumbing</option>
                  <option value="electrician">Electrical</option>
                  <option value="carpenter">Carpentry</option>
                  <option value="painter">Painting</option>
                  <option value="hvac">HVAC & Cooling</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </div>

          </div>

          {/* Workers Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="p-6 border border-slate-200 hover:shadow-lg transition-shadow space-y-4">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.user.avatarUrl}
                      alt={worker.user.firstName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-slate-900">
                          {worker.user.firstName} {worker.user.lastName}
                        </h3>
                        {worker.isVerified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-600 font-semibold">{worker.tradeTitle}</p>
                      <p className="text-[11px] text-slate-500">{worker.city}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {worker.hourlyRate} <span className="text-xs text-slate-500 font-medium">ETB/hr</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-slate-400 font-normal">({worker.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Comparison Badge Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience:</span>
                    <span className="font-extrabold text-slate-800">{worker.experienceYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed:</span>
                    <span className="font-extrabold text-slate-800">{worker.completedJobs} Jobs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Availability:</span>
                    <span className={`font-extrabold ${worker.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {worker.isAvailable ? 'Available Now' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {worker.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Portfolio Photos Showcase */}
                {worker.portfolio && worker.portfolio.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block">Recent Work Sample:</span>
                    <div className="flex items-center gap-2">
                      {worker.portfolio.map((item) => (
                        <div key={item.id} className="relative h-14 w-20 rounded-lg overflow-hidden border border-slate-200">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-[11px] text-slate-400 font-medium ml-1">
                        {worker.portfolio[0].title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Coverage: {worker.serviceAreas.slice(0, 3).join(', ')}
                  </span>

                  <button
                    onClick={() => {
                      setBookingModalWorker(worker);
                      setBookingFormData(prev => ({
                        ...prev,
                        serviceTitle: `Standard Service Call with ${worker.user.firstName}`
                      }));
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with GPS Location</span>
                  </button>
                </div>

              </Card>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: MY BOOKINGS & RATE THEM */}
      {selectedTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              My Service Bookings & Completed Jobs
            </h2>
            <span className="text-xs text-slate-500">{bookings.length} Platform Bookings</span>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} padding="md" className="space-y-4 border-l-4 border-l-brand-600 shadow-sm">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                      #{booking.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      booking.status === 'accepted' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {booking.status === 'accepted' ? 'Pro Confirmed' : booking.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-700">
                    Agreed Fee: <span className="text-emerald-600 text-base font-black font-mono">{booking.estimatedCost} ETB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service:</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{booking.serviceDescription}</p>
                    <p className="text-slate-500 mt-1">🗓️ {booking.scheduledDate} at {booking.scheduledTime}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Professional:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{booking.workerName}</p>
                    <p className="text-brand-600">{booking.workerTrade}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Location & GPS:</span>
                    <p className="text-slate-700 font-medium mt-0.5">📍 {booking.location}</p>
                    {booking.gpsCoordinates && (
                      <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                        GPS: {booking.gpsCoordinates.lat}° N, {booking.gpsCoordinates.lng}° E
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Rate Them */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Created on {booking.createdAt.substring(0, 10)}
                  </span>

                  <div className="flex items-center gap-2">
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => setReviewModalBooking(booking)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Rate & Review Tradesperson</span>
                      </button>
                    )}

                    <Link to={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Receipt & History
                      </Button>
                    </Link>
                  </div>
                </div>

              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BOOK / REQUEST WITH GPS LOCATION */}
      {bookingModalWorker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Book Service Call • {bookingModalWorker.user.firstName}
                </h3>
              </div>
              <button 
                onClick={() => setBookingModalWorker(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Booking request dispatched to {bookingModalWorker.user.firstName} with your GPS pin!</span>
              </div>
            )}

            {/* Worker Summary Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img src={bookingModalWorker.user.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <span className="font-bold text-slate-900 block">{bookingModalWorker.user.firstName} {bookingModalWorker.user.lastName}</span>
                  <span className="text-slate-500">{bookingModalWorker.tradeTitle}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-brand-600 block text-sm">{bookingModalWorker.hourlyRate} ETB/hr</span>
                <span className="text-emerald-600 font-bold">★ {bookingModalWorker.rating}</span>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Describe Problem or Service Needed
                </label>
                <input
                  type="text"
                  value={bookingFormData.serviceTitle}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, serviceTitle: e.target.value })}
                  placeholder="e.g. Kitchen pipe burst, circuit breaker tripping..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.date}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={bookingFormData.timeSlot}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="08:00 AM - 10:00 AM">Morning (08:00 AM - 10:00 AM)</option>
                    <option value="10:00 AM - 12:00 PM">Late Morning (10:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Service Address & GPS Coordinates */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Service Address & GPS Location Pin
                </label>
                <input
                  type="text"
                  value={bookingFormData.address}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, address: e.target.value })}
                  placeholder="Street name, neighborhood, house number (e.g. Bole Atlas, Addis Ababa)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />

                {/* GPS Coordinates & Auto-detection */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current GPS Coordinates:</span>
                    <span className="font-mono font-bold text-slate-800">
                      📍 Lat: {bookingFormData.lat}° N, Lng: {bookingFormData.lng}° E
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-sky-600" />
                    <span>Auto-Detect GPS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Access Notes for Tradesperson
                </label>
                <textarea
                  value={bookingFormData.notes}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                  rows={2}
                  placeholder="Gate code, landmark near building, parking info..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="md" 
                  onClick={() => setBookingModalWorker(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  className="font-bold shadow-md shadow-brand-500/20"
                >
                  Send Booking Request
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: RATE & REVIEW TRADESPERSON */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">Rate & Review Tradesperson</h3>
              </div>
              <button 
                onClick={() => setReviewModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Thank you for your rating!</h4>
                <p className="text-xs text-slate-500">
                  Your feedback helps maintain fair quality and builds trusted trade reputation on Tegagn.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                <div className="text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    How was the service provided by <strong>{reviewModalBooking.workerName}</strong> for "{reviewModalBooking.serviceDescription}"?
                  </p>
                  
                  {/* Star Rating Selector */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    {rating === 5 ? 'Outstanding (5.0)' : rating === 4 ? 'Very Good (4.0)' : rating === 3 ? 'Average (3.0)' : 'Needs Improvement'}
                  </span>
                </div>

                {/* Sub-ratings */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Punctuality:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setPunctualityRating(s)} className="cursor-pointer">
                          <Star className={`w-3.5 h-3.5 ${s <= punctualityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Workmanship Quality:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setQualityRating(s)} className="cursor-pointer">
                          <Star className={`w-3.5 h-3.5 ${s <= qualityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Site Cleanliness:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setCleanlinessRating(s)} className="cursor-pointer">
                          <Star className={`w-3.5 h-3.5 ${s <= cleanlinessRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Written Review & Feedback
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Describe how the repair was completed, transparency of price, and recommendation..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="md" 
                    onClick={() => setReviewModalBooking(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="md" 
                    className="font-bold shadow-md shadow-brand-500/20"
                  >
                    Submit Rating & Review
                  </Button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
