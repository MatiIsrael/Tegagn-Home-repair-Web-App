import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Calendar, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Edit3, 
  AlertCircle,
  PlusCircle,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  Navigation,
  ExternalLink,
  Bell,
  Clock,
  Sparkles,
  Camera,
  Layers,
  Send,
  Eye,
  CheckCircle2,
  Sliders,
  Compass
} from 'lucide-react';
import { 
  PLACEHOLDER_WORKER_REQUESTS, 
  PLACEHOLDER_WORKERS, 
  PLACEHOLDER_WORKER_POSTS 
} from '../data/mockData';
import { Booking, BookingStatus, WorkerPost } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { authService, bookingService } from '../services/api';
import { postService } from '../services/postService';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const WorkerDashboard: React.FC = () => {
  const { t } = useThemeLanguage();
  const currentWorker = PLACEHOLDER_WORKERS[0];
  const [storedUser, setStoredUser] = useState(() => authService.getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => setStoredUser(authService.getStoredUser());
    window.addEventListener('tegagn_auth_changed', handleAuthChange);
    return () => window.removeEventListener('tegagn_auth_changed', handleAuthChange);
  }, []);

  const workerDisplayName = storedUser?.firstName
    ? `${storedUser.firstName}${storedUser.lastName ? ` ${storedUser.lastName}` : ''}`.trim()
    : storedUser?.email
      ? storedUser.email.split('@')[0]
      : 'Trade Professional';

  const workerId = storedUser?.id || currentWorker.id;

  // Requests state with GPS coordinates
  const [requests, setRequests] = useState<Booking[]>(PLACEHOLDER_WORKER_REQUESTS);
  const [isAvailable, setIsAvailable] = useState(currentWorker.isAvailable);

  useEffect(() => {
    const loadRequests = () => {
      bookingService.getWorkerRequests(workerId).then(setRequests);
    };
    loadRequests();
    window.addEventListener('tegagn_bookings_changed', loadRequests);
    return () => window.removeEventListener('tegagn_bookings_changed', loadRequests);
  }, [workerId]);

  const [callNotice, setCallNotice] = useState<{ phone: string; clientName: string } | null>(null);

  const handleCallClient = (e: React.MouseEvent | null, phoneNumber?: string, clientName?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanPhone = (phoneNumber || '+251 92 555 6677').trim();
    
    // 1. Copy to clipboard for easy dial/paste on any device
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhone).catch(() => {});
    }

    // 2. Trigger native telephone link
    const dialDigits = cleanPhone.replace(/[\s-]/g, '');
    window.location.href = `tel:${dialDigits}`;

    // 3. Display interactive calling banner
    setCallNotice({ phone: cleanPhone, clientName: clientName || 'Client' });
    setTimeout(() => {
      setCallNotice(null);
    }, 4500);
  };

  // Tab state: 'requests' | 'posts' | 'profile' | 'notifications'
  const [activeTab, setActiveTab] = useState<'requests' | 'posts' | 'profile' | 'notifications'>('requests');

  // Worker Posts Showcase state loaded from centralized postService
  const [posts, setPosts] = useState<WorkerPost[]>(() => {
    const workerPosts = postService.getWorkerPosts(workerId);
    return workerPosts.length > 0 ? workerPosts : postService.getAllPosts().slice(0, 3);
  });

  const [postSubmittedNotice, setPostSubmittedNotice] = useState(false);

  useEffect(() => {
    const handlePostsChange = () => {
      const updated = postService.getWorkerPosts(workerId);
      setPosts(updated.length > 0 ? updated : postService.getAllPosts().slice(0, 3));
    };
    window.addEventListener('tegagn_posts_changed', handlePostsChange);
    return () => window.removeEventListener('tegagn_posts_changed', handlePostsChange);
  }, [workerId]);

  // Profile Quick Edit State ("ability write money fill everything")
  const [profileData, setProfileData] = useState({
    tradeTitle: currentWorker.tradeTitle,
    hourlyRate: currentWorker.hourlyRate || 350,
    bio: currentWorker.bio,
    experienceYears: currentWorker.experienceYears,
    city: currentWorker.city,
    serviceAreas: currentWorker.serviceAreas.join(', '),
  });
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Modal State: "Publish New Work Post"
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: currentWorker.trade,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800',
    priceCharged: 850,
    currency: 'ETB',
    duration: '3 hours',
    location: 'Bole Medhanialem, Addis Ababa',
    lat: 9.0084,
    lng: 38.7891
  });

  // Initial default notifications
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'New Booking Request with GPS Location',
      message: 'Kaleb Getachew requested urgent valve replacement in Kazanchis (Lat: 9.0185, Lng: 38.7698).',
      time: '15 mins ago',
      type: 'booking',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Customer Reaction on Your Post',
      message: 'Bethlehem Assefa liked your post "Complete Bathroom PPR Pipe Overhaul".',
      time: '1 hour ago',
      type: 'reaction',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'New Customer Comment',
      message: 'Yonas Gebre commented: "Do you also service apartment complexes in Kazanchis?"',
      time: '2 hours ago',
      type: 'comment',
      unread: false
    }
  ];

  const getStoredNotifications = () => {
    try {
      const raw = localStorage.getItem('tegagn_worker_notifications');
      if (raw) {
        const stored = JSON.parse(raw);
        return [...stored, ...DEFAULT_NOTIFICATIONS];
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  };

  // Notifications Stream State
  const [notifications, setNotifications] = useState(getStoredNotifications);

  useEffect(() => {
    const handleNotifsChange = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('tegagn_worker_notifications_changed', handleNotifsChange);
    window.addEventListener('tegagn_bookings_changed', handleNotifsChange);
    return () => {
      window.removeEventListener('tegagn_worker_notifications_changed', handleNotifsChange);
      window.removeEventListener('tegagn_bookings_changed', handleNotifsChange);
    };
  }, []);

  // Request status change handler
  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    bookingService.updateBookingStatus(bookingId, newStatus);
    setRequests(prev =>
      prev.map(r => (r.id === bookingId ? { ...r, status: newStatus } : r))
    );
  };

  // Submit new work post -> Goes to Admin first for regulatory review
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;

    postService.createPost({
      workerId: storedUser?.id || currentWorker.id,
      workerName: workerDisplayName,
      workerTrade: profileData.tradeTitle || currentWorker.tradeTitle,
      workerAvatar: storedUser?.avatarUrl || currentWorker.user.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
      workerRating: currentWorker.rating,
      workerHourlyRate: profileData.hourlyRate,
      workerExperience: profileData.experienceYears,
      title: newPost.title,
      description: newPost.description,
      category: newPost.category,
      imageUrl: newPost.imageUrl,
      priceCharged: Number(newPost.priceCharged),
      currency: newPost.currency || 'ETB',
      duration: newPost.duration,
      location: newPost.location,
      lat: newPost.lat,
      lng: newPost.lng,
    });

    setIsPostModalOpen(false);
    setPostSubmittedNotice(true);
    setTimeout(() => setPostSubmittedNotice(false), 8000);

    // Reset post form
    setNewPost({
      title: '',
      category: currentWorker.trade,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
      priceCharged: 600,
      currency: 'ETB',
      duration: '2 hours',
      location: 'Addis Ababa',
      lat: 9.0200,
      lng: 38.7500
    });
  };

  // Save quick profile and pricing changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-5">
          <img
            src={storedUser?.avatarUrl || currentWorker.user.avatarUrl}
            alt={workerDisplayName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-amber-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                {currentWorker.trade} Professional
              </span>
              {currentWorker.isVerified && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Pro
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {t('hello')}, {workerDisplayName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {profileData.tradeTitle} • <span className="font-mono font-bold text-amber-400">{profileData.hourlyRate} ETB/hr</span> • {profileData.city}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              isAvailable
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isAvailable ? t('statusAccepting') : t('statusPaused')}
          </button>

          <Button 
            variant="accent" 
            size="md" 
            className="font-bold flex items-center gap-1.5"
            onClick={() => setIsPostModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('postMyWork')}</span>
          </Button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative cursor-pointer"
            title="Customer Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => n.unread) && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">18,400 ETB</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Earnings (Month)</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentWorker.completedJobs + 2}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('completedRepairs')}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">4.95 / 5.0</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('verifiedClientReviews')}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{requests.length} Requests</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('incomingCustomerJobRequests')}</div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('requestsTab')} ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('myPostsTab')} ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t('profileTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t('notificationsTab')} ({notifications.filter(n => n.unread).length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: CUSTOMER REQUESTS & GPS LOCATION */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Incoming Customer Job Requests
              </h2>
              <p className="text-xs text-slate-500">
                View customer issue description, requested schedule, and exact GPS coordinates for on-site navigation.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold">
              GPS Navigation Enabled
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} padding="md" className="space-y-4 border-l-4 border-l-amber-500 shadow-sm">
                
                {/* Header row: Reference, status, estimated money */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                      #{req.id}
                    </span>
                    {req.status === 'pending' ? (
                      <Badge variant="pending">Action Required: New Request</Badge>
                    ) : req.status === 'accepted' ? (
                      <Badge variant="accepted">Accepted / Scheduled</Badge>
                    ) : (
                      <Badge variant="completed">Completed</Badge>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-700">
                    Client Agreed Budget: <span className="text-emerald-600 text-base font-black font-mono">{req.estimatedCost} ETB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Details & Customer Info (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {req.serviceDescription}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-medium">
                        <strong className="text-slate-800 dark:text-slate-100">Client:</strong> {req.customerName}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <button
                          type="button"
                          onClick={(e) => handleCallClient(e, req.customerPhone, req.customerName)}
                          className="text-amber-600 dark:text-amber-400 hover:underline font-mono font-bold cursor-pointer"
                          title="Click to dial client directly"
                        >
                          {req.customerPhone || '+251 92 555 6677'}
                        </button>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {req.scheduledDate} at {req.scheduledTime}
                      </span>
                    </div>

                    {req.images && req.images.length > 0 && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          📸 Attached Problem Photos from Client ({req.images.length}):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {req.images.map((img, i) => (
                            <a
                              key={i}
                              href={img}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square w-16 h-16 shrink-0 shadow-sm hover:ring-2 hover:ring-amber-500 cursor-pointer"
                              title="Click to view full photo"
                            >
                              <img src={img} alt={`Problem photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {req.notes && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                        <strong>Client Instructions:</strong> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* Right Column: GPS Location Card & Actions (5 cols) */}
                  <div className="lg:col-span-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Client Service Location & GPS</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        Live Map Pin
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      📍 {req.location}
                    </p>

                    {/* GPS Coordinates Badge & Navigation Action */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-slate-600">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">GPS Coordinates:</span>
                        <span className="font-bold text-slate-900">
                          Lat: {req.gpsCoordinates?.lat || 9.0084}° N, Lng: {req.gpsCoordinates?.lng || 38.7891}° E
                        </span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${req.gpsCoordinates?.lat || 9.0084},${req.gpsCoordinates?.lng || 38.7891}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate (GPS)</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button
                            variant="accent"
                            size="sm"
                            icon={<Check className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                          >
                            {t('acceptJob')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                            icon={<X className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                          >
                            {t('declineJob')}
                          </Button>
                          <button
                            type="button"
                            onClick={(e) => handleCallClient(e, req.customerPhone, req.customerName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            title={`Call Client: ${req.customerPhone || '+251 92 555 6677'}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Call Client</span>
                          </button>
                        </>
                      ) : req.status === 'accepted' ? (
                        <>
                          <Button
                            variant="navy"
                            size="sm"
                            icon={<Check className="w-4 h-4 text-emerald-400" />}
                            onClick={() => handleUpdateStatus(req.id, 'completed')}
                          >
                            {t('markJobCompleted')}
                          </Button>
                          <button
                            type="button"
                            onClick={(e) => handleCallClient(e, req.customerPhone, req.customerName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title={`Call Client: ${req.customerPhone || '+251 92 555 6677'}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                            <span>Call Client</span>
                          </button>
                        </>
                      ) : req.status === 'cancelled' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            <span>{req.rebackGuarantee?.refundTransactionId ? 'Cancelled (100% Re-back Refund Issued)' : 'Cancelled'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCallClient(e, req.customerPhone, req.customerName)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-500 text-xs font-medium cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-amber-500" />
                            <span>{req.customerPhone || '+251 92 555 6677'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('statusCompleted')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCallClient(e, req.customerPhone, req.customerName)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-500 text-xs font-medium cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-amber-500" />
                            <span>{req.customerPhone || '+251 92 555 6677'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY WORK POSTS & SHOWCASE */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-50 to-orange-50 border border-amber-200">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Tradesperson Work Showcase & Community Posts
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Post photos and details of completed repairs with prices charged. Customers view your posts in their hub, react with likes and comments, and hire you directly!
              </p>
            </div>

            <Button
              variant="accent"
              size="md"
              className="font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              onClick={() => setIsPostModalOpen(true)}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Work Post</span>
            </Button>
          </div>

          {postSubmittedNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-950">Job Showcase Released & Sent to Admin for Review</p>
                <p className="text-amber-800 mt-0.5">
                  Your new job post has been routed to the Platform Administrator for fair price and quality verification. It will appear live on the Customer Hub community feed as soon as the admin approves it.
                </p>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden p-0 border border-slate-200 hover:shadow-lg transition-shadow bg-white flex flex-col justify-between">
                
                <div>
                  {/* Photo Image */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden group">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      {post.approvalStatus === 'pending' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-xs">
                          ⏳ In Admin Review
                        </span>
                      ) : post.approvalStatus === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                          ✅ Live on Market
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                          ❌ Action Required
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-md">
                        {post.priceCharged} {post.currency}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>

                    {post.adminFeedback && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        <strong className="text-amber-950">Admin Notice:</strong> {post.adminFeedback}
                      </div>
                    )}

                    {/* Metadata: Price, duration, location */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <span>⏱️ Duration: <strong>{post.duration}</strong></span>
                      <span>📍 {post.location}</span>
                    </div>

                    {/* Engagement Bar: Likes and Comments */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4 text-slate-600">
                        <span className="flex items-center gap-1.5 font-bold text-rose-600">
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                          <span>{post.likesCount} Customer Likes</span>
                        </span>

                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>{post.comments.length} Comments</span>
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500">
                        {post.approvalStatus === 'approved' ? 'Public in Customer Hub' : 'Held in Admin Queue'}
                      </span>
                    </div>

                    {/* Existing Customer Comments */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700 block text-[11px]">Recent Customer Inquiries:</span>
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-slate-600 border-l-2 border-amber-400 pl-2">
                            <strong className="text-slate-900">{c.authorName}:</strong> "{c.comment}"
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

              </Card>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: PROFILE & PRICING CONTROLS ("ability write money fill everything") */}
      {activeTab === 'profile' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Own Profile & Custom Money / Rate Settings
              </h2>
              <p className="text-xs text-slate-500">
                Set your standard hourly charge, trade title, bio, and operational service neighborhoods.
              </p>
            </div>
            {profileSavedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pricing & Profile Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline / Trade Title
                </label>
                <input
                  type="text"
                  value={profileData.tradeTitle}
                  onChange={(e) => setProfileData({ ...profileData, tradeTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hourly Rate / Charge (ETB) 💰
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={profileData.hourlyRate}
                    onChange={(e) => setProfileData({ ...profileData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    min={50}
                    step={10}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">ETB/hr</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={profileData.experienceYears}
                  onChange={(e) => setProfileData({ ...profileData, experienceYears: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  min={1}
                  max={50}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City & Primary Hub
                </label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Neighborhoods Covered (comma-separated)
              </label>
              <input
                type="text"
                value={profileData.serviceAreas}
                onChange={(e) => setProfileData({ ...profileData, serviceAreas: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                placeholder="Bole, Kazanchis, Sarbet, CMC, Piassa"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Profile Bio & Expertise Description
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="accent" size="md" className="font-bold">
                Save Profile & Pricing Updates
              </Button>
            </div>

          </form>
        </Card>
      )}

      {/* TAB 4: CUSTOMER ACTIVITY & NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Notifications Stream
              </h2>
              <p className="text-xs text-slate-500">
                Real-time alerts when customers book your services, like your work posts, or leave questions.
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className="py-3.5 flex items-start gap-3 text-xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === 'booking' ? 'bg-amber-100 text-amber-600' :
                  n.type === 'reaction' ? 'bg-rose-100 text-rose-600' :
                  'bg-sky-100 text-sky-600'
                }`}>
                  {n.type === 'booking' ? <Compass className="w-4 h-4" /> :
                   n.type === 'reaction' ? <Heart className="w-4 h-4" /> :
                   <MessageSquare className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-slate-600">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL: POST MY WORK */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Publish Completed Work Post</h3>
              </div>
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job / Project Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. Copper Pipe Overhaul & Silent Water Booster Installation"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description of Repairs & Techniques Used
                </label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the problem, materials used, and how you solved it..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price Charged / Money (ETB) 💰
                  </label>
                  <input
                    type="number"
                    value={newPost.priceCharged}
                    onChange={(e) => setNewPost({ ...newPost, priceCharged: parseFloat(e.target.value) || 0 })}
                    min={50}
                    step={10}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Duration
                  </label>
                  <input
                    type="text"
                    value={newPost.duration}
                    onChange={(e) => setNewPost({ ...newPost, duration: e.target.value })}
                    placeholder="e.g. 3 hours / 1 day"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Location / Sub-city
                  </label>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                    placeholder="e.g. Bole Medhanialem, Addis Ababa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Photo Image URL
                  </label>
                  <input
                    type="url"
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="md" 
                  onClick={() => setIsPostModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="accent" 
                  size="md" 
                  className="font-bold shadow-md shadow-amber-500/20"
                >
                  Publish to Customer Community Feed
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Floating Active Call Notice */}
      {callNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white border border-amber-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-sm ring-1 ring-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                Calling Client...
              </span>
              <p className="text-sm font-bold truncate text-white">{callNotice.clientName}</p>
              <p className="text-xs font-mono font-bold text-amber-300">
                {callNotice.phone} <span className="text-[10px] text-emerald-400 font-sans font-normal">(Copied)</span>
              </p>
            </div>
            <a
              href={`tel:${callNotice.phone.replace(/[\s-]/g, '')}`}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shrink-0 transition-colors shadow-sm"
            >
              Dial Now
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
