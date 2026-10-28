/**
 * ============================================================================
 * TEGAGN API SERVICE CLIENT
 * ============================================================================
 * Connects the React frontend to the custom Python Django REST API
 * (Django REST Framework + PostgreSQL).
 * Includes token storage, automatic authorization header injection,
 * and reliable fallback to structured mock data if the backend is unreachable.
 * ============================================================================
 */

import { 
  WorkerProfile, 
  Category, 
  Booking, 
  WorkerFilterParams, 
  WorkerServiceItem, 
  Review,
  User 
} from '../types';
import { 
  PLACEHOLDER_WORKERS, 
  PLACEHOLDER_CATEGORIES, 
  PLACEHOLDER_CUSTOMER_BOOKINGS,
  PLACEHOLDER_WORKER_REQUESTS,
  PLACEHOLDER_SERVICES,
  PLACEHOLDER_REVIEWS 
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { realDb } from './realDb';

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
const hasBackendApi = Boolean(
  envApiUrl && 
  !envApiUrl.includes('placeholder') && 
  !envApiUrl.includes('localhost:8000') &&
  (envApiUrl.startsWith('http://') || envApiUrl.startsWith('https://'))
);
const API_BASE_URL = hasBackendApi ? envApiUrl : '';

export interface PaginatedResponse<T> {
  count: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tegagn_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// 1. Authentication & User Profile Service
// ---------------------------------------------------------------------------
export const authService = {
  getToken(): string | null {
    return localStorage.getItem('tegagn_access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('tegagn_refresh_token');
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('tegagn_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setSession(access: string, refresh: string, user: User, rememberEmail: boolean = true) {
    localStorage.setItem('tegagn_access_token', access);
    localStorage.setItem('tegagn_refresh_token', refresh);
    localStorage.setItem('tegagn_user', JSON.stringify(user));
    if (rememberEmail && user.email) {
      localStorage.setItem('tegagn_remembered_email', user.email);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tegagn_auth_changed'));
    }
  },

  clearSession() {
    localStorage.removeItem('tegagn_access_token');
    localStorage.removeItem('tegagn_refresh_token');
    localStorage.removeItem('tegagn_user');
    // Keep tegagn_remembered_email so returning users are always remembered!
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tegagn_auth_changed'));
    }
  },

  async login(
    email: string, 
    password: string, 
    requiredRole?: 'customer' | 'worker' | 'admin'
  ): Promise<{ access: string; refresh: string; user: User }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Cloud Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          const userRole = (profile?.role || authData.user.user_metadata?.role || 'customer') as 'customer' | 'worker' | 'admin';

          if (requiredRole && userRole !== requiredRole) {
            await supabase.auth.signOut();
            throw new ApiError(403, `Access Denied: This account is registered as a ${userRole}. Please log in via the ${userRole} portal.`);
          }

          const user: User = {
            id: authData.user.id,
            email: authData.user.email || cleanEmail,
            firstName: profile?.first_name || authData.user.user_metadata?.first_name || 'Customer',
            lastName: profile?.last_name || authData.user.user_metadata?.last_name || '',
            role: userRole,
            phoneNumber: profile?.phone_number || authData.user.user_metadata?.phone_number || '',
            avatarUrl: profile?.avatar_url,
          };

          this.setSession(authData.session?.access_token || 'sb_token', authData.session?.refresh_token || 'sb_refresh', user);
          return { access: authData.session?.access_token || 'sb_token', refresh: authData.session?.refresh_token || 'sb_refresh', user };
        }
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
        // Fall through to realDb check
      }
    }

    // 2. Fallback to Relational Database
    try {
      const user = await realDb.authenticate(cleanEmail, password, requiredRole);
      const token = `real_jwt_${user.id}_${Date.now()}`;
      this.setSession(token, token + '_ref', user);
      return { access: token, refresh: token + '_ref', user };
    } catch (err: any) {
      throw new ApiError(401, err.message || 'Authentication rejected. Verify credentials or register.');
    }
  },

  async registerCustomer(payload: any): Promise<{ access: string; refresh: string; user: User }> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const firstName = payload.firstName || payload.first_name || 'Customer';
    const lastName = payload.lastName || payload.last_name || '';
    const phoneNumber = payload.phoneNumber || payload.phone_number || payload.phone || '+251911234567';
    const password = payload.password;

    // 1. Call server-side API to register directly in Supabase Authentication -> Users
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          firstName,
          lastName,
          role: 'customer',
          phoneNumber,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          this.setSession(data.token, data.token + '_ref', data.user);
          return { access: data.token, refresh: data.token + '_ref', user: data.user };
        }
      }
    } catch (e) {
      console.warn('Direct server registration fallback', e);
    }

    // 2. Fallback to local DB
    const localUser = await realDb.registerCustomer({
      email: cleanEmail,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    const token = `real_jwt_${localUser.id}_${Date.now()}`;
    this.setSession(token, token + '_ref', localUser);
    return { access: token, refresh: token + '_ref', user: localUser };
  },

  async registerWorker(payload: any): Promise<{ access: string; refresh: string; user: User }> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const firstName = payload.firstName || payload.first_name || 'Worker';
    const lastName = payload.lastName || payload.last_name || '';
    const phoneNumber = payload.phoneNumber || payload.phone_number || payload.phone || '+251911234567';
    const password = payload.password;
    const trade = payload.trade || 'technician';
    const tradeTitle = payload.tradeTitle || payload.trade_title || `${trade.toUpperCase()} Specialist`;
    const hourlyRate = Number(payload.hourlyRate || payload.hourly_rate) || 350;
    const experienceYears = Number(payload.experienceYears || payload.experience_years) || 3;
    const city = payload.city || 'Addis Ababa';
    const serviceAreas = payload.serviceAreas || payload.service_areas || ['Addis Ababa'];
    const bio = payload.bio || '';

    // 1. Call server-side API to register directly in Supabase Authentication -> Users
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          firstName,
          lastName,
          role: 'worker',
          phoneNumber,
          trade,
          tradeTitle,
          hourlyRate,
          experienceYears,
          city,
          serviceAreas,
          bio,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          this.setSession(data.token, data.token + '_ref', data.user);
          return { access: data.token, refresh: data.token + '_ref', user: data.user };
        }
      }
    } catch (e) {
      console.warn('Direct server registration fallback', e);
    }

    // 2. Fallback to local DB
    const localUser = await realDb.registerWorker({
      email: cleanEmail,
      password,
      firstName,
      lastName,
      phoneNumber,
      trade,
      tradeTitle,
      hourlyRate,
      experienceYears,
      city,
      serviceAreas,
      bio,
    });

    const token = `real_jwt_${localUser.id}_${Date.now()}`;
    this.setSession(token, token + '_ref', localUser);
    return { access: token, refresh: token + '_ref', user: localUser };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url,
      };
    } catch {
      return this.getStoredUser();
    }
  },

  async logout(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (refresh) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ refresh }),
        });
      } catch {
        // proceed with client session clearance
      }
    }
    this.clearSession();
  }
};

// ---------------------------------------------------------------------------
// 2. Worker Directory & Search Service
// ---------------------------------------------------------------------------
export const workerService = {
  async getWorkers(filters?: WorkerFilterParams): Promise<WorkerProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.minRating) params.append('min_rating', filters.minRating.toString());
      if (filters?.maxHourlyRate) params.append('max_price', filters.maxHourlyRate.toString());
      if (filters?.isAvailable !== undefined) params.append('is_available', filters.isAvailable.toString());
      if (filters?.isVerified !== undefined) params.append('is_verified', filters.isVerified.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetch(`${API_BASE_URL}/workers/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results;
        if (results && results.length > 0) {
          return results.map((w: any) => ({
            id: w.id,
            userId: w.user?.id || w.id,
            user: {
              id: w.user?.id || w.id,
              email: w.user?.email || '',
              firstName: w.user?.first_name || '',
              lastName: w.user?.last_name || '',
              role: 'worker',
              avatarUrl: w.user?.avatar_url,
            },
            trade: (w.primary_category?.slug || 'general') as any,
            tradeTitle: w.trade_title,
            hourlyRate: parseFloat(w.hourly_rate) || 0,
            experienceYears: w.experience_years || 0,
            bio: w.bio || '',
            city: w.user?.city || 'Addis Ababa',
            serviceAreas: w.service_areas || [],
            skills: w.skills || [],
            rating: parseFloat(w.rating_average) || 0,
            reviewsCount: w.reviews_count || 0,
            isVerified: w.is_verified || false,
            isAvailable: w.is_available ?? true,
            completedJobs: w.completed_jobs_count || 0,
            certifications: w.certifications || [],
            portfolio: [],
            reviews: []
          }));
        }
      }
    } catch {
      // Fall through to mock foundation
    }

    // 2. Fetch and merge real database registered workers with mock foundation
    const dbWorkers = realDb.getWorkerProfiles();
    const existingIds = new Set(dbWorkers.map(w => w.id));
    let result = [...dbWorkers, ...PLACEHOLDER_WORKERS.filter(p => !existingIds.has(p.id))];
    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(w => 
          w.user.firstName.toLowerCase().includes(query) ||
          w.user.lastName.toLowerCase().includes(query) ||
          w.tradeTitle.toLowerCase().includes(query) ||
          w.skills.some(s => s.toLowerCase().includes(query)) ||
          w.city.toLowerCase().includes(query)
        );
      }
      if (filters.category && filters.category !== 'all') {
        result = result.filter(w => w.trade.toLowerCase() === filters.category?.toLowerCase());
      }
      if (filters.minRating) {
        result = result.filter(w => w.rating >= (filters.minRating || 0));
      }
      if (filters.maxHourlyRate) {
        result = result.filter(w => w.hourlyRate <= (filters.maxHourlyRate || Infinity));
      }
      if (filters.isAvailable !== undefined) {
        result = result.filter(w => w.isAvailable === filters.isAvailable);
      }
      if (filters.isVerified !== undefined) {
        result = result.filter(w => w.isVerified === filters.isVerified);
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            result.sort((a, b) => a.hourlyRate - b.hourlyRate);
            break;
          case 'price_desc':
            result.sort((a, b) => b.hourlyRate - a.hourlyRate);
            break;
          case 'rating_desc':
            result.sort((a, b) => b.rating - a.rating);
            break;
          case 'experience_desc':
            result.sort((a, b) => b.experienceYears - a.experienceYears);
            break;
        }
      }
    }
    return Promise.resolve(result);
  },

  async getWorkerById(id: string): Promise<WorkerProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/${id}/`);
      if (res.ok) {
        const w = await res.json();
        return {
          id: w.id,
          userId: w.user?.id || w.id,
          user: {
            id: w.user?.id || w.id,
            email: w.user?.email || '',
            firstName: w.user?.first_name || '',
            lastName: w.user?.last_name || '',
            role: 'worker',
            avatarUrl: w.user?.avatar_url,
          },
          trade: (w.primary_category?.slug || 'general') as any,
          tradeTitle: w.trade_title,
          hourlyRate: parseFloat(w.hourly_rate) || 0,
          experienceYears: w.experience_years || 0,
          bio: w.bio || '',
          city: w.user?.city || 'Addis Ababa',
          serviceAreas: w.service_areas || [],
          skills: w.skills || [],
          rating: parseFloat(w.rating_average) || 0,
          reviewsCount: w.reviews_count || 0,
          isVerified: w.is_verified || false,
          isAvailable: w.is_available ?? true,
          completedJobs: w.completed_jobs_count || 0,
          certifications: w.certifications || [],
          portfolio: [],
          reviews: (w.reviews || []).map((r: any) => ({
            id: r.id,
            workerId: w.id,
            customerName: r.customer_name || 'Customer',
            customerAvatar: r.customer_avatar,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
            jobType: r.service_title || 'General Service',
          }))
        };
      }
    } catch {
      // Fallback
    }

    // Fallback to real database workers + placeholder workers
    const dbWorkers = realDb.getWorkerProfiles();
    const foundInDb = dbWorkers.find(w => w.id === id || w.userId === id);
    if (foundInDb) return foundInDb;

    const worker = PLACEHOLDER_WORKERS.find(w => w.id === id || w.userId === id);
    if (!worker) return null;
    const reviews = PLACEHOLDER_REVIEWS.filter(r => r.workerId === id);
    return { ...worker, reviews };
  }
};

// ---------------------------------------------------------------------------
// 3. Category Service
// ---------------------------------------------------------------------------
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    // 1. Supabase Cloud Database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbCategories, error } = await supabase.from('categories').select('*');
        if (!error && dbCategories && dbCategories.length > 0) {
          return dbCategories.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            iconName: c.icon || 'Wrench',
            description: c.description || '',
            workerCount: 12,
            popularServices: []
          }));
        }
      } catch (e) {
        console.warn('Supabase categories fetch error', e);
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/services/categories/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            iconName: c.icon_name || 'Wrench',
            description: c.description || '',
            workerCount: c.workers_count || 0,
            popularServices: []
          }));
        }
      }
    } catch {
      // Fallback
    }
    return Promise.resolve(PLACEHOLDER_CATEGORIES);
  }
};

const BOOKINGS_STORAGE_KEY = 'tegagn_bookings_store_v2';
const REVIEWS_STORAGE_KEY = 'tegagn_reviews_store_v2';

function readStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return [...PLACEHOLDER_CUSTOMER_BOOKINGS, ...PLACEHOLDER_WORKER_REQUESTS];
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const initial = [...PLACEHOLDER_CUSTOMER_BOOKINGS, ...PLACEHOLDER_WORKER_REQUESTS];
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [...PLACEHOLDER_CUSTOMER_BOOKINGS, ...PLACEHOLDER_WORKER_REQUESTS];
  }
}

function writeStoredBookings(list: Booking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('tegagn_bookings_changed'));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
}

function readStoredReviews(): Review[] {
  if (typeof window === 'undefined') return PLACEHOLDER_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(PLACEHOLDER_REVIEWS));
      return PLACEHOLDER_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return PLACEHOLDER_REVIEWS;
  }
}

function writeStoredReviews(list: Review[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('tegagn_reviews_changed'));
  } catch (e) {
    console.error('Failed to save reviews', e);
  }
}

// ---------------------------------------------------------------------------
// 4. Booking Service
// ---------------------------------------------------------------------------
export const bookingService = {
  async getCustomerBookings(customerId?: string): Promise<Booking[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/?role=customer`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const results = Array.isArray(data) ? data : data.results;
          if (results) {
            return results.map((b: any) => ({
              id: b.id,
              customerId: b.customer?.id || '',
              customerName: b.customer_name || 'Customer',
              customerPhone: b.customer_phone,
              workerId: b.worker?.id || '',
              workerName: b.worker_name || 'Worker',
              workerTrade: b.service_category?.name || 'Tradesperson',
              serviceDescription: b.problem_description || b.service_title,
              scheduledDate: b.scheduled_date,
              scheduledTime: b.scheduled_time_slot,
              location: b.service_address,
              status: b.status,
              estimatedCost: parseFloat(b.agreed_price) || 0,
              createdAt: b.created_at,
            }));
          }
        }
      } catch {
        // Fallback
      }
    }
    const all = readStoredBookings();
    if (customerId) {
      const filtered = all.filter(b => b.customerId === customerId);
      return Promise.resolve(filtered.length > 0 ? filtered : all);
    }
    return Promise.resolve(all);
  },

  async getWorkerRequests(workerId?: string): Promise<Booking[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/?role=worker`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const results = Array.isArray(data) ? data : data.results;
          if (results) {
            return results.map((b: any) => ({
              id: b.id,
              customerId: b.customer?.id || '',
              customerName: b.customer_name || 'Customer',
              customerPhone: b.customer_phone,
              workerId: b.worker?.id || '',
              workerName: b.worker_name || 'Worker',
              workerTrade: b.service_category?.name || 'Tradesperson',
              serviceDescription: b.problem_description || b.service_title,
              scheduledDate: b.scheduled_date,
              scheduledTime: b.scheduled_time_slot,
              location: b.service_address,
              status: b.status,
              estimatedCost: parseFloat(b.agreed_price) || 0,
              createdAt: b.created_at,
            }));
          }
        }
      } catch {
        // Fallback
      }
    }
    const all = readStoredBookings();
    if (workerId) {
      const filtered = all.filter(b => b.workerId === workerId);
      return Promise.resolve(filtered.length > 0 ? filtered : all);
    }
    return Promise.resolve(all);
  },

  async getBookingById(id: string): Promise<Booking | null> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${id}/`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const b = await res.json();
          return {
            id: b.id,
            customerId: b.customer?.id || '',
            customerName: b.customer_name || 'Customer',
            customerPhone: b.customer_phone,
            workerId: b.worker?.id || '',
            workerName: b.worker_name || 'Worker',
            workerTrade: b.service_category?.name || 'Tradesperson',
            serviceDescription: b.problem_description || b.service_title,
            scheduledDate: b.scheduled_date,
            scheduledTime: b.scheduled_time_slot,
            location: b.service_address,
            status: b.status,
            estimatedCost: parseFloat(b.agreed_price) || 0,
            createdAt: b.created_at,
          };
        }
      } catch {
        // Fallback
      }
    }
    const all = readStoredBookings();
    return Promise.resolve(all.find(b => b.id === id) || null);
  },

  async createBooking(payload: any): Promise<Booking> {
    // Helper to store worker notification
    const notifyWorker = (booking: Booking) => {
      try {
        const notifKey = 'tegagn_worker_notifications';
        const existingRaw = localStorage.getItem(notifKey);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `🚨 New Job Request: ${booking.serviceDescription}`,
          message: `${booking.customerName} requested service at ${booking.location} on ${booking.scheduledDate} (${booking.scheduledTime}). GPS: ${booking.gpsCoordinates?.lat || '9.0084'}° N, ${booking.gpsCoordinates?.lng || '38.7891'}° E.`,
          time: 'Just now',
          type: 'booking',
          unread: true,
          bookingId: booking.id,
          images: booking.images || []
        };
        localStorage.setItem(notifKey, JSON.stringify([newNotif, ...existingList]));
        window.dispatchEvent(new Event('tegagn_worker_notifications_changed'));
      } catch (e) {
        console.warn('Worker notification sync notice', e);
      }
    };

    // 1. Supabase Cloud Database Insert
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbBooking, error } = await supabase
          .from('bookings')
          .insert({
            customer_name: payload.customerName || 'Customer',
            customer_phone: payload.customerPhone || '+251 91 123 4567',
            worker_name: payload.workerName || 'Worker Professional',
            worker_trade: payload.workerTrade || 'Plumbing Specialist',
            service_description: payload.serviceDescription || 'Home Repair Service',
            scheduled_date: payload.scheduledDate || new Date().toISOString().split('T')[0],
            scheduled_time: payload.scheduledTime || '10:00 AM - 12:00 PM',
            location: payload.location || 'Addis Ababa',
            status: (payload.status as any) || 'pending',
            estimated_cost: payload.estimatedCost || 500,
            notes: payload.images && payload.images.length > 0 ? JSON.stringify({ images: payload.images, notes: payload.notes }) : (payload.notes || ''),
          })
          .select()
          .single();

        if (!error && dbBooking) {
          const newBooking: Booking = {
            id: dbBooking.id,
            customerId: dbBooking.customer_id || payload.customerId || 'cust-101',
            customerName: dbBooking.customer_name,
            customerPhone: dbBooking.customer_phone,
            workerId: dbBooking.worker_id || payload.workerId || 'worker-101',
            workerName: dbBooking.worker_name,
            workerTrade: dbBooking.worker_trade,
            serviceDescription: dbBooking.service_description,
            scheduledDate: dbBooking.scheduled_date,
            scheduledTime: dbBooking.scheduled_time,
            location: dbBooking.location,
            gpsCoordinates: payload.gpsCoordinates || { lat: 9.0084, lng: 38.7891 },
            images: payload.images || [],
            status: dbBooking.status,
            estimatedCost: parseFloat(dbBooking.estimated_cost) || 0,
            notes: dbBooking.notes || '',
            createdAt: dbBooking.created_at,
          };

          const all = readStoredBookings();
          writeStoredBookings([newBooking, ...all]);
          notifyWorker(newBooking);
          return newBooking;
        }
      } catch (e) {
        console.warn('Supabase booking create error, falling back', e);
      }
    }

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to local store
      }
    }

    const all = readStoredBookings();
    const newBooking: Booking = {
      id: payload.id || `bk-${Date.now().toString().slice(-6)}`,
      customerId: payload.customerId || 'cust-101',
      customerName: payload.customerName || 'Customer',
      customerPhone: payload.customerPhone || '+251 91 123 4567',
      workerId: payload.workerId || 'worker-101',
      workerName: payload.workerName || 'Worker Professional',
      workerTrade: payload.workerTrade || 'Plumbing Specialist',
      serviceDescription: payload.serviceDescription || 'Home Repair Service',
      scheduledDate: payload.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: payload.scheduledTime || '10:00 AM - 12:00 PM',
      location: payload.location || 'Addis Ababa',
      gpsCoordinates: payload.gpsCoordinates || { lat: 9.0084, lng: 38.7891 },
      images: payload.images || [],
      status: (payload.status as any) || 'pending',
      estimatedCost: payload.estimatedCost || 700,
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newBooking, ...all];
    writeStoredBookings(updated);
    notifyWorker(newBooking);
    return newBooking;
  },

  async updateBookingStatus(id: string, newStatus: string, reason?: string): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateBookingStatus error', e);
      }
    }

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${id}/transition/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ to_status: newStatus, reason }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to local store
      }
    }

    const all = readStoredBookings();
    const updated = all.map(b => (b.id === id ? { ...b, status: newStatus as any } : b));
    writeStoredBookings(updated);
    return { success: true, id, status: newStatus, reason };
  }
};

// ---------------------------------------------------------------------------
// 5. Review & Rating Service
// ---------------------------------------------------------------------------
export const reviewService = {
  async getReviews(workerId: string): Promise<Review[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/?worker_id=${workerId}`);
        if (res.ok) {
          const data = await res.json();
          const results = Array.isArray(data) ? data : data.results;
          return results.map((r: any) => ({
            id: r.id,
            workerId,
            customerName: r.customer_name || 'Customer',
            customerAvatar: r.customer_avatar,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
            jobType: r.service_title || 'Completed Job',
          }));
        }
      } catch {
        // Fallback
      }
    }
    const all = readStoredReviews();
    return all.filter(r => r.workerId === workerId);
  },

  async submitReview(payload: {
    booking_id: string;
    rating: number;
    comment: string;
    punctuality_rating?: number;
    quality_rating?: number;
    cleanliness_rating?: number;
  }): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }

    const all = readStoredReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      workerId: 'worker-101',
      customerName: 'Verified Customer',
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      jobType: 'Home Repair Service',
    };
    writeStoredReviews([newReview, ...all]);
    return { success: true, review: newReview };
  },

  async replyToReview(reviewId: string, reply: string): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ worker_reply: reply }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    const all = readStoredReviews();
    const updated = all.map(r => (r.id === reviewId ? { ...r, response: reply } : r));
    writeStoredReviews(updated);
    return { success: true, id: reviewId, response: reply };
  }
};

// ---------------------------------------------------------------------------
// 6. Platform Administration Service
// ---------------------------------------------------------------------------
export const adminService = {
  async getStats(): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats/`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return {
      total_users: 148,
      verified_workers: 42,
      active_jobs: 19,
      flagged_charges: 3,
      fair_pricing_compliance: '96.4%',
    };
  },

  async getUsers(params?: Record<string, string>): Promise<any> {
    if (API_BASE_URL) {
      try {
        const query = new URLSearchParams(params || {}).toString();
        const res = await fetch(`${API_BASE_URL}/admin/users/?${query}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { count: 3, results: [] };
  },

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_active: isActive, reason }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { success: true, userId, is_active: isActive, reason };
  },

  async getWorkers(params?: Record<string, string>): Promise<any> {
    if (API_BASE_URL) {
      try {
        const query = new URLSearchParams(params || {}).toString();
        const res = await fetch(`${API_BASE_URL}/admin/workers/?${query}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { count: 5, results: PLACEHOLDER_WORKERS };
  },

  async verifyWorker(workerId: string, isVerified: boolean, notes?: string): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/verify/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_verified: isVerified, notes }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { success: true, workerId, is_verified: isVerified, notes };
  },

  async getBookings(params?: Record<string, string>): Promise<any> {
    if (API_BASE_URL) {
      try {
        const query = new URLSearchParams(params || {}).toString();
        const res = await fetch(`${API_BASE_URL}/admin/bookings/?${query}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { count: readStoredBookings().length, results: readStoredBookings() };
  },

  async mediatePrice(bookingId: string, payload: {
    action: 'cap_price' | 'warn_worker' | 'cancel_predatory';
    new_price?: number;
    reason: string;
    regulatory_note?: string;
  }): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/mediate-price/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { success: true, bookingId, ...payload };
  },

  async moderateReview(reviewId: string, isPublic: boolean, reason?: string): Promise<any> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/moderate/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_public: isPublic, reason }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { success: true, reviewId, is_public: isPublic, reason };
  },

  async getAuditLogs(params?: Record<string, string>): Promise<any> {
    if (API_BASE_URL) {
      try {
        const query = new URLSearchParams(params || {}).toString();
        const res = await fetch(`${API_BASE_URL}/admin/audit-logs/?${query}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return { count: 3, results: [] };
  }
};

// ---------------------------------------------------------------------------
// 7. Worker Catalog Service
// ---------------------------------------------------------------------------
export const workerCatalogService = {
  async getServices(workerId?: string): Promise<WorkerServiceItem[]> {
    if (workerId) {
      return Promise.resolve(PLACEHOLDER_SERVICES.filter(s => s.workerId === workerId));
    }
    return Promise.resolve(PLACEHOLDER_SERVICES);
  }
};

export { API_BASE_URL };
