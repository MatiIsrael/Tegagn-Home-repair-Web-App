import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Briefcase, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Layers,
  FileCheck,
  AlertTriangle,
  Scale,
  Search,
  Filter,
  ArrowUpRight,
  Lock,
  Unlock,
  MessageSquare,
  Eye,
  RefreshCw,
  LogOut,
  Gavel,
  History,
  UserCheck,
  UserX,
  Building2,
  TrendingUp,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Sliders,
  Check,
  X,
  Tag
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { adminService, authService } from '../services/api';
import { postService, getTradeBenchmark } from '../services/postService';
import { WorkerPost } from '../types';

interface AdminBookingRecord {
  id: string;
  reference_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  worker_id: string;
  worker_name: string;
  worker_trade: string;
  worker_hourly_rate?: number;
  service_title: string;
  customer_notes?: string;
  service_address?: string;
  status: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  agreed_price: number;
  currency: string;
  is_high_price_flagged?: boolean;
  benchmark_price?: number;
  excess_ratio?: number;
  created_at: string;
}

interface AdminUserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'customer' | 'worker' | 'admin';
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

interface AdminAuditRecord {
  id: number;
  actor_email: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  payload: any;
  ip_address: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Authentication check: Admin only
  const currentUser = authService.getStoredUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  // Tab State: 'posts' (Moderation) | 'sentinel' (Price Gouging) | 'workers' (Verification) | 'users' (Oversight) | 'audit' (Logs)
  const [activeTab, setActiveTab] = useState<'posts' | 'sentinel' | 'workers' | 'users' | 'audit'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Worker Posts & Job Releases Moderation State
  const [allPosts, setAllPosts] = useState<WorkerPost[]>(() => postService.getAllPosts());
  const [postFilter, setPostFilter] = useState<'all' | 'pending' | 'flagged'>('pending');

  // Listen for real-time post changes
  useEffect(() => {
    const handlePostsChange = () => setAllPosts(postService.getAllPosts());
    window.addEventListener('tegagn_posts_changed', handlePostsChange);
    return () => window.removeEventListener('tegagn_posts_changed', handlePostsChange);
  }, []);

  // Post Price Regulation Modal State
  const [priceCapModalPost, setPriceCapModalPost] = useState<WorkerPost | null>(null);
  const [cappedPriceInput, setCappedPriceInput] = useState<number>(850);
  const [priceCapFeedback, setPriceCapFeedback] = useState<string>('Excessive price reduced to fair trade ceiling for customer protection.');

  // Bookings & Price Gouging State
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([
    {
      id: 'bk-flagged-01',
      reference_number: 'TG-2026-X89A1',
      customer_id: 'cust-101',
      customer_name: 'Bethlehem Tadesse',
      customer_email: 'bethlehem.t@gmail.com',
      customer_phone: '+251 91 123 4567',
      worker_id: 'work-201',
      worker_name: 'Abebe Bikila',
      worker_trade: 'Plumbing Specialist',
      worker_hourly_rate: 350.00,
      service_title: 'Emergency Kitchen Pipe Leak Repair',
      customer_notes: 'Worker demanded 2,800 ETB for 45 minutes of pipe sealing, threatening to leave water running if not paid immediately.',
      service_address: 'Bole Medhanialem, House 412, Addis Ababa',
      status: 'pending',
      scheduled_date: '2026-10-19',
      scheduled_time_slot: '02:00 PM - 04:00 PM',
      agreed_price: 2800.00,
      currency: 'ETB',
      is_high_price_flagged: true,
      benchmark_price: 650.00,
      excess_ratio: 4.3,
      created_at: '2026-10-19T11:20:00Z',
    },
    {
      id: 'bk-flagged-02',
      reference_number: 'TG-2026-M42B9',
      customer_id: 'cust-102',
      customer_name: 'Yonas Gebre',
      customer_email: 'yonas.g@outlook.com',
      customer_phone: '+251 92 888 1234',
      worker_id: 'work-202',
      worker_name: 'Henok Tesfaye',
      worker_trade: 'Electrical Services',
      worker_hourly_rate: 400.00,
      service_title: 'Circuit Breaker Tripping Diagnostic',
      customer_notes: 'Worker quoted 3,200 ETB stating imported breaker surcharge.',
      service_address: 'Kazanchis, Kirkos, Addis Ababa',
      status: 'in_progress',
      scheduled_date: '2026-10-19',
      scheduled_time_slot: '10:00 AM - 12:00 PM',
      agreed_price: 3200.00,
      currency: 'ETB',
      is_high_price_flagged: true,
      benchmark_price: 800.00,
      excess_ratio: 4.0,
      created_at: '2026-10-19T08:15:00Z',
    },
    {
      id: 'bk-norm-03',
      reference_number: 'TG-2026-K11C4',
      customer_id: 'cust-103',
      customer_name: 'Sara Mengistu',
      customer_email: 'sara.m@gmail.com',
      customer_phone: '+251 93 456 7890',
      worker_id: 'work-203',
      worker_name: 'Dawit Alemayehu',
      worker_trade: 'Custom Woodworker',
      worker_hourly_rate: 300.00,
      service_title: 'Cabinet Hinge Alignment & Lock Fixing',
      customer_notes: 'Smooth scheduling, fair price.',
      service_address: 'CMC Michael, Addis Ababa',
      status: 'completed',
      scheduled_date: '2026-10-18',
      scheduled_time_slot: '04:00 PM - 06:00 PM',
      agreed_price: 750.00,
      currency: 'ETB',
      is_high_price_flagged: false,
      benchmark_price: 800.00,
      excess_ratio: 0.94,
      created_at: '2026-10-18T14:30:00Z',
    }
  ]);

  // Price Mediation Modal State for Bookings
  const [activeMediationBooking, setActiveMediationBooking] = useState<AdminBookingRecord | null>(null);
  const [newCappedBookingPrice, setNewCappedBookingPrice] = useState<number>(650);

  // Worker Verification Queue
  const [pendingWorkers, setPendingWorkers] = useState([
    {
      id: 'work-verify-01',
      fullName: 'Tewodros Kassaye',
      trade: 'Master Electrician',
      email: 'tewodros.k@gmail.com',
      phone: '+251 91 199 8877',
      experienceYears: 9,
      city: 'Addis Ababa',
      licenseNumber: 'ET-MOW-2024-9182',
      documents: ['National ID Card', 'Trade Competency Assessment Certificate', 'Ethio-Electric Safety License'],
      isVerified: false
    },
    {
      id: 'work-verify-02',
      fullName: 'Genet Haile',
      trade: 'Appliance Repair Technician',
      email: 'genet.h@gmail.com',
      phone: '+251 92 555 4433',
      experienceYears: 4,
      city: 'Addis Ababa',
      licenseNumber: 'ET-AA-2025-4411',
      documents: ['National ID Card', 'Technical College Certificate'],
      isVerified: false
    }
  ]);

  // User Accounts
  const [users, setUsers] = useState<AdminUserRecord[]>([
    {
      id: 'user-01',
      email: 'bethlehem.t@gmail.com',
      first_name: 'Bethlehem',
      last_name: 'Tadesse',
      full_name: 'Bethlehem Tadesse',
      role: 'customer',
      phone_number: '+251911234567',
      is_active: true,
      created_at: '2026-09-12'
    },
    {
      id: 'user-02',
      email: 'abebe.b@gmail.com',
      first_name: 'Abebe',
      last_name: 'Bikila',
      full_name: 'Abebe Bikila',
      role: 'worker',
      phone_number: '+251922334455',
      is_active: true,
      created_at: '2026-08-01'
    },
    {
      id: 'user-03',
      email: 'yonas.g@outlook.com',
      first_name: 'Yonas',
      last_name: 'Gebre',
      full_name: 'Yonas Gebre',
      role: 'customer',
      phone_number: '+251928881234',
      is_active: true,
      created_at: '2026-10-02'
    },
    {
      id: 'user-04',
      email: 'predatory.worker@example.com',
      first_name: 'Mulugeta',
      last_name: 'Bekele',
      full_name: 'Mulugeta Bekele',
      role: 'worker',
      phone_number: '+251944556677',
      is_active: false,
      created_at: '2026-07-20'
    }
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([
    {
      id: 992,
      actor_email: 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'JOB_APPROVED',
      resource_type: 'worker_post',
      resource_id: 'post-101',
      description: 'Approved worker job showcase for Abebe Tadesse after verifying fair trade pricing (850 ETB).',
      payload: { worker: 'Abebe Tadesse', price: '850 ETB', category: 'plumbing' },
      ip_address: '197.156.103.42',
      created_at: '2026-10-19 19:40:00'
    },
    {
      id: 991,
      actor_email: 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'PRICE_ADJUSTED',
      resource_type: 'booking',
      resource_id: 'TG-2026-X89A1',
      description: 'Regulated price intervention: Capped agreed price from 2,800 to 650 ETB due to predatory pricing violation.',
      payload: { old_price: '2800.00', new_price: '650.00', worker: 'Abebe Bikila' },
      ip_address: '197.156.103.42',
      created_at: '2026-10-19 11:45:00'
    },
    {
      id: 990,
      actor_email: 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'WARNING_ISSUED',
      resource_type: 'worker',
      resource_id: 'work-202',
      description: 'Formal price-gouging violation notice issued to Henok Tesfaye for 4x benchmark quote.',
      payload: { booking_ref: 'TG-2026-M42B9', penalty: 'First Warning' },
      ip_address: '197.156.103.42',
      created_at: '2026-10-19 10:15:22'
    }
  ]);

  // -------------------------------------------------------------
  // CONTROLLER ACTIONS: Worker Job Releases & Moderation
  // -------------------------------------------------------------

  const handleApproveWorkerPost = (post: WorkerPost) => {
    postService.approvePost(post.id, 'Approved by Platform Regulatory Authority. Released to Customer Hub.');
    setNotice({
      type: 'success',
      text: `Worker job "${post.title}" has been approved and released to the Customer Hub community feed.`
    });

    // Add to audit log
    const newLog: AdminAuditRecord = {
      id: Date.now(),
      actor_email: currentUser?.email || 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'JOB_RELEASE_APPROVED',
      resource_type: 'worker_post',
      resource_id: post.id,
      description: `Approved worker job "${post.title}" for ${post.workerName} (${post.priceCharged} ${post.currency}).`,
      payload: { worker: post.workerName, price: post.priceCharged, category: post.category },
      ip_address: '197.156.103.42',
      created_at: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleOpenPriceCapModal = (post: WorkerPost) => {
    setPriceCapModalPost(post);
    const benchmark = getTradeBenchmark(post.category);
    setCappedPriceInput(benchmark.benchmarkMax);
    setPriceCapFeedback(`Price reduced from ${post.priceCharged} ETB to fair trade ceiling of ${benchmark.benchmarkMax} ETB to protect customers from high charges.`);
  };

  const handleConfirmPriceCap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceCapModalPost) return;

    postService.capPriceAndApprove(priceCapModalPost.id, Number(cappedPriceInput), priceCapFeedback);
    setNotice({
      type: 'success',
      text: `Price for "${priceCapModalPost.title}" was capped at ${cappedPriceInput} ETB. Job is now approved and live for customers.`
    });

    const newLog: AdminAuditRecord = {
      id: Date.now(),
      actor_email: currentUser?.email || 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'PRICE_CAPPED_AND_APPROVED',
      resource_type: 'worker_post',
      resource_id: priceCapModalPost.id,
      description: `Regulated high price on "${priceCapModalPost.title}" from ${priceCapModalPost.priceCharged} ETB down to ${cappedPriceInput} ETB.`,
      payload: { oldPrice: priceCapModalPost.priceCharged, newPrice: cappedPriceInput, worker: priceCapModalPost.workerName },
      ip_address: '197.156.103.42',
      created_at: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setPriceCapModalPost(null);
  };

  const handleRejectWorkerPost = (post: WorkerPost) => {
    const reason = prompt(`Provide administrative reason for rejecting job "${post.title}":`, 'Pricing exceeds reasonable market limits or lacks clear scope details.');
    if (reason === null) return;

    postService.rejectPost(post.id, reason);
    setNotice({
      type: 'error',
      text: `Worker job "${post.title}" was rejected and returned to worker for revision.`
    });

    const newLog: AdminAuditRecord = {
      id: Date.now(),
      actor_email: currentUser?.email || 'admin@gmail.com',
      actor_name: 'Platform Overseer',
      action: 'JOB_REJECTED',
      resource_type: 'worker_post',
      resource_id: post.id,
      description: `Rejected worker job "${post.title}" for ${post.workerName}. Reason: ${reason}`,
      payload: { worker: post.workerName, reason },
      ip_address: '197.156.103.42',
      created_at: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // -------------------------------------------------------------
  // CONTROLLER ACTIONS: Bookings Price Mediation
  // -------------------------------------------------------------

  const handleMediateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMediationBooking) return;

    setBookings(prev => prev.map(b => {
      if (b.id !== activeMediationBooking.id) return b;
      return {
        ...b,
        agreed_price: Number(newCappedBookingPrice),
        is_high_price_flagged: false,
        status: 'price_mediated'
      };
    }));

    setNotice({
      type: 'success',
      text: `Booking ${activeMediationBooking.reference_number} agreed price capped from ${activeMediationBooking.agreed_price} to ${newCappedBookingPrice} ETB.`
    });

    setActiveMediationBooking(null);
  };

  // -------------------------------------------------------------
  // CONTROLLER ACTIONS: Worker Credentials Verification
  // -------------------------------------------------------------

  const handleVerifyWorker = (workerId: string, approve: boolean) => {
    setPendingWorkers(prev => prev.filter(w => w.id !== workerId));
    setNotice({
      type: 'success',
      text: `Worker credentials have been ${approve ? 'verified and approved' : 'rejected'}.`
    });
  };

  // -------------------------------------------------------------
  // CONTROLLER ACTIONS: User Oversight
  // -------------------------------------------------------------

  const handleToggleUserStatus = (user: AdminUserRecord) => {
    const nextStatus = !user.is_active;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: nextStatus } : u));
    setNotice({
      type: 'success',
      text: `Account for ${user.full_name} (${user.email}) is now ${nextStatus ? 'Active' : 'Suspended'}.`
    });
  };

  const handleAdminSignOut = () => {
    authService.clearSession();
    navigate('/admin/login');
  };

  // Filtered Posts Queue
  const pendingPostsCount = allPosts.filter(p => p.approvalStatus === 'pending').length;
  const flaggedPostsCount = allPosts.filter(p => p.isPriceFlagged).length;

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (postFilter === 'pending') {
      return post.approvalStatus === 'pending';
    }
    if (postFilter === 'flagged') {
      return post.isPriceFlagged === true;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      
      {/* Top Regulatory Authority Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">TEGAGN REGULATORY AUTHORITY</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  Government-Style Oversight
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Marketplace Consumer Protection • Price Gouging Sentinel • Worker Dispute Mediation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Regulator Session</span>
              <span className="text-xs font-bold text-brand-700 font-mono">{currentUser?.email || 'admin@gmail.com'}</span>
            </div>

            <button
              onClick={handleAdminSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Prominent Regulatory Controller Notice */}
        <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 text-xs text-brand-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-brand-950">Marketplace Controller & Anti-Price-Gouging Terminal</p>
              <p className="text-brand-800 mt-0.5">
                Worker job releases must be reviewed and price-checked here before going live to customers. <strong>Service booking is strictly disabled for platform administrators.</strong>
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Inspection Mode • Booking Restricted</span>
          </div>
        </div>

        {/* Global Notice Alert */}
        {notice && (
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
            notice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 shrink-0 ${notice.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span className="font-medium">{notice.text}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => { setActiveTab('posts'); setPostFilter('pending'); }}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeTab === 'posts' && postFilter === 'pending'
                ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Worker Jobs</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{pendingPostsCount}</span>
              <span className="text-[11px] font-semibold text-amber-600">Awaiting Admin Review</span>
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('sentinel'); }}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeTab === 'sentinel'
                ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Alerts Flagged</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{bookings.filter(b => b.is_high_price_flagged).length + flaggedPostsCount}</span>
              <span className="text-[11px] font-semibold text-rose-600">Excessive Fee Risk</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('workers')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeTab === 'workers'
                ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Trade Licenses</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{pendingWorkers.length}</span>
              <span className="text-[11px] font-semibold text-brand-600">Technician Applicants</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeTab === 'users'
                ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Regulated Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{users.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600">Active Participants</span>
            </div>
          </div>

        </div>

        {/* Controller Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
          
          <div className="flex flex-wrap gap-2">
            
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Worker Job Moderation</span>
              {pendingPostsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'posts' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingPostsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sentinel')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'sentinel'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Price Gouging Sentinel</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'sentinel' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {bookings.filter(b => b.is_high_price_flagged).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('workers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Trade Credentials</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'workers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {pendingWorkers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Oversight</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Regulatory Log</span>
            </button>

          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, trade, or participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: WORKER JOB RELEASES & MODERATION (Primary requirement) */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'posts' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Worker Job Release Moderation Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  When a worker releases their job or portfolio work, it routes here first. Admin must review quality, location, and price before it goes live to customers.
                </p>
              </div>

              {/* Sub-filter pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPostFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    postFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending Review ({pendingPostsCount})
                </button>
                <button
                  onClick={() => setPostFilter('flagged')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    postFilter === 'flagged'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  High Price Risks ({flaggedPostsCount})
                </button>
                <button
                  onClick={() => setPostFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    postFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Posts ({allPosts.length})
                </button>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Jobs Awaiting Moderation</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All submitted worker jobs in this filter have been controlled and moderated. New worker submissions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => {
                  const benchmark = getTradeBenchmark(post.category);
                  const isHighPrice = post.isPriceFlagged || (post.priceCharged > benchmark.benchmarkMax * 1.5);

                  return (
                    <Card key={post.id} className="p-0 overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white flex flex-col justify-between">
                      
                      <div>
                        {/* Header: Worker identity and submission status */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.workerAvatar}
                              alt={post.workerName}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{post.workerName}</span>
                                <Badge variant="trade" size="sm">{post.workerTrade}</Badge>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>★ {post.workerRating || 4.9}</span>
                                <span>•</span>
                                <span>{post.workerExperience || 5} yrs exp</span>
                              </p>
                            </div>
                          </div>

                          <div>
                            {post.approvalStatus === 'pending' ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                ⏳ Pending Review
                              </span>
                            ) : post.approvalStatus === 'approved' ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✅ Approved & Live
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                ❌ Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image Showcase */}
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>{post.location}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                          
                          <div>
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {post.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                              {post.description}
                            </p>
                          </div>

                          {/* Price Analysis Box */}
                          <div className={`p-3.5 rounded-xl border text-xs ${
                            isHighPrice
                              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                                Pricing Analysis
                              </span>
                              {isHighPrice && (
                                <span className="inline-flex items-center gap-1 font-bold text-rose-700 text-[11px]">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  High Money Asking Risk
                                </span>
                              )}
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                              <div>
                                <span className="text-[11px] text-slate-500 block">Worker Requested Price:</span>
                                <span className={`text-base font-black ${isHighPrice ? 'text-rose-600 font-mono' : 'text-slate-900 font-mono'}`}>
                                  {post.priceCharged.toLocaleString()} {post.currency}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] text-slate-500 block">Fair Trade Benchmark:</span>
                                <span className="text-sm font-bold text-slate-700 font-mono">
                                  {benchmark.fairRange}
                                </span>
                              </div>
                            </div>

                            {post.adminFeedback && (
                              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                                <strong>Admin Notice:</strong> {post.adminFeedback}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Footer Controller Actions (NO BOOKING BUTTON!) */}
                      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2">
                        
                        <div className="text-[11px] text-slate-500 text-center font-medium">
                          🔒 Regulatory Mode: Admin reviews and moderates. Booking is strictly restricted.
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {post.approvalStatus !== 'approved' ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                className="flex-1 justify-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                icon={<Check className="w-4 h-4" />}
                                onClick={() => handleApproveWorkerPost(post)}
                              >
                                Approve & Release
                              </Button>

                              {isHighPrice && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex-1 justify-center font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800"
                                  icon={<Sliders className="w-4 h-4" />}
                                  onClick={() => handleOpenPriceCapModal(post)}
                                >
                                  Cap High Price
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="justify-center text-rose-600 hover:bg-rose-50 border-rose-200"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => handleRejectWorkerPost(post)}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <div className="w-full flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                              <span>✓ Live on Customer Feed</span>
                              <button
                                onClick={() => handleOpenPriceCapModal(post)}
                                className="text-xs font-bold text-brand-700 hover:underline cursor-pointer"
                              >
                                Regulate Price
                              </button>
                            </div>
                          )}
                        </div>

                      </div>

                    </Card>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: PRICE GOUGING SENTINEL (Customer Bookings Mediation) */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'sentinel' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Active Bookings & Price Gouging Sentinel</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated algorithm detects when workers demand excessive money from customers beyond fair market benchmarks.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {bookings.filter(b => b.is_high_price_flagged).length} Cases Needing Mediation
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Reference & Service</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Worker / Trade</th>
                      <th className="p-4">Agreed Price</th>
                      <th className="p-4">Market Benchmark</th>
                      <th className="p-4">Status & Alert</th>
                      <th className="p-4 text-right">Controller Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {bookings.map((b) => (
                      <tr key={b.id} className={b.is_high_price_flagged ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'}>
                        
                        <td className="p-4 font-mono">
                          <span className="font-bold text-brand-700">{b.reference_number}</span>
                          <span className="block text-slate-900 font-sans font-medium text-xs mt-0.5">{b.service_title}</span>
                          <span className="text-[10px] text-slate-400 block">{b.service_address}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{b.customer_name}</span>
                          <span className="text-slate-400 text-[11px]">{b.customer_phone}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{b.worker_name}</span>
                          <span className="text-slate-500 text-[11px]">{b.worker_trade}</span>
                        </td>

                        <td className="p-4 font-mono font-bold">
                          <span className={b.is_high_price_flagged ? 'text-rose-600 text-sm' : 'text-slate-900'}>
                            {b.agreed_price.toLocaleString()} {b.currency}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-slate-600">
                          <span>{b.benchmark_price} {b.currency}</span>
                          {b.excess_ratio && b.excess_ratio > 1.5 && (
                            <span className="block text-[10px] font-bold text-rose-600">
                              +{((b.excess_ratio - 1) * 100).toFixed(0)}% Over Benchmark
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {b.is_high_price_flagged ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Price Flagged ({b.excess_ratio}x)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {b.status}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {b.is_high_price_flagged ? (
                            <button
                              onClick={() => {
                                setActiveMediationBooking(b);
                                setNewCappedBookingPrice(b.benchmark_price || 650);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Mediate Price
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Compliant</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: WORKER TRADE CREDENTIALS */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-extrabold text-base text-slate-900">Worker Competency & ID Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Regulator review of government ID, electrical/plumbing competency certificates, and background checks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWorkers.map((worker) => (
                <Card key={worker.id} className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{worker.fullName}</h3>
                      <Badge variant="trade" size="sm" className="mt-1">{worker.trade}</Badge>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">{worker.licenseNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Email: <strong className="text-slate-800">{worker.email}</strong></div>
                    <div>Phone: <strong className="text-slate-800">{worker.phone}</strong></div>
                    <div>Experience: <strong className="text-slate-800">{worker.experienceYears} Years</strong></div>
                    <div>Location: <strong className="text-slate-800">{worker.city}</strong></div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider mb-1">Uploaded Credentials:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {worker.documents.map((doc, idx) => (
                        <li key={idx} className="font-medium">{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1 justify-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleVerifyWorker(worker.id, true)}
                    >
                      Verify & Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 justify-center text-rose-600 hover:bg-rose-50 border-rose-200"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => handleVerifyWorker(worker.id, false)}
                    >
                      Reject
                    </Button>
                  </div>

                </Card>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: USER & ACCOUNT OVERSIGHT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-extrabold text-base text-slate-900">User & Participant Oversight</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Suspend abusive accounts or reactivate compliant users to ensure marketplace integrity.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Regulatory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{u.full_name}</td>
                      <td className="p-4 font-mono text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'customer' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{u.phone_number}</td>
                      <td className="p-4">
                        {u.is_active ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            u.is_active 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 5: REGULATORY AUDIT LOG */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-extrabold text-base text-slate-900">Verifiable Regulatory Action Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically verifiable timestamped audit trail of administrative price caps, job approvals, and suspensions.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{log.resource_type}: {log.resource_id}</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.description}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                    <span>{log.created_at}</span>
                    <span className="block text-[10px] text-slate-500">Actor: {log.actor_email}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: Capping Worker Job Release Price */}
      {/* ----------------------------------------------------------------- */}
      {priceCapModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Regulate & Cap Service Price</h3>
              </div>
              <button 
                onClick={() => setPriceCapModalPost(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Worker <strong>{priceCapModalPost.workerName}</strong> requested <strong>{priceCapModalPost.priceCharged} {priceCapModalPost.currency}</strong> for:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                "{priceCapModalPost.title}"
              </div>
            </div>

            <form onSubmit={handleConfirmPriceCap} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Mandatory Fair Trade Price Cap (ETB)
                </label>
                <input
                  type="number"
                  value={cappedPriceInput}
                  onChange={(e) => setCappedPriceInput(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Category benchmark fair range: {getTradeBenchmark(priceCapModalPost.category).fairRange}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Regulatory Notice & Feedback
                </label>
                <textarea
                  value={priceCapFeedback}
                  onChange={(e) => setPriceCapFeedback(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center"
                  onClick={() => setPriceCapModalPost(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="flex-1 justify-center font-bold"
                  icon={<Gavel className="w-4 h-4" />}
                >
                  Enforce Cap & Release
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: Booking Price Mediation */}
      {/* ----------------------------------------------------------------- */}
      {activeMediationBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Booking Price Intervention</h3>
              </div>
              <button 
                onClick={() => setActiveMediationBooking(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Booking <strong>{activeMediationBooking.reference_number}</strong> between customer <strong>{activeMediationBooking.customer_name}</strong> and worker <strong>{activeMediationBooking.worker_name}</strong>.
              </p>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 font-medium">
                Customer Complaint: {activeMediationBooking.customer_notes}
              </div>
            </div>

            <form onSubmit={handleMediateBooking} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Capped Fair Price (ETB)
                </label>
                <input
                  type="number"
                  value={newCappedBookingPrice}
                  onChange={(e) => setNewCappedBookingPrice(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center"
                  onClick={() => setActiveMediationBooking(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="flex-1 justify-center font-bold"
                >
                  Enforce Mediation
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
