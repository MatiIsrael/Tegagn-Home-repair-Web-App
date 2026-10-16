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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

  setSession(access: string, refresh: string, user: User) {
    localStorage.setItem('tegagn_access_token', access);
    localStorage.setItem('tegagn_refresh_token', refresh);
    localStorage.setItem('tegagn_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('tegagn_access_token');
    localStorage.removeItem('tegagn_refresh_token');
    localStorage.removeItem('tegagn_user');
  },

  async login(email: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new ApiError(res.status, errData.detail || 'Login failed. Please check credentials.', errData);
      }

      const data = await res.json();
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        role: data.user.role,
        phoneNumber: data.user.phone_number,
        avatarUrl: data.user.avatar_url,
      };

      this.setSession(data.access, data.refresh, user);
      return { access: data.access, refresh: data.refresh, user };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, 'Unable to connect to authentication server.', err);
    }
  },

  async registerCustomer(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/register/customer/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Customer registration failed.', errData);
    }
    return res.json();
  },

  async registerWorker(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/register/worker/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Worker registration failed.', errData);
    }
    return res.json();
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

    // Frontend fallback with placeholder mock data
    let result = [...PLACEHOLDER_WORKERS];
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

    const worker = PLACEHOLDER_WORKERS.find(w => w.id === id);
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

// ---------------------------------------------------------------------------
// 4. Booking Service
// ---------------------------------------------------------------------------
export const bookingService = {
  async getCustomerBookings(): Promise<Booking[]> {
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
    return Promise.resolve(PLACEHOLDER_CUSTOMER_BOOKINGS);
  },

  async getWorkerRequests(): Promise<Booking[]> {
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
    return Promise.resolve(PLACEHOLDER_WORKER_REQUESTS);
  },

  async getBookingById(id: string): Promise<Booking | null> {
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
    const allBookings = [...PLACEHOLDER_CUSTOMER_BOOKINGS, ...PLACEHOLDER_WORKER_REQUESTS];
    return allBookings.find(b => b.id === id) || null;
  },

  async createBooking(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to create booking.', err);
    }
    return res.json();
  },

  async updateBookingStatus(id: string, newStatus: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/transition/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ to_status: newStatus, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to transition booking status.', err);
    }
    return res.json();
  }
};

// ---------------------------------------------------------------------------
// 5. Review & Rating Service
// ---------------------------------------------------------------------------
export const reviewService = {
  async getReviews(workerId: string): Promise<Review[]> {
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
    return PLACEHOLDER_REVIEWS.filter(r => r.workerId === workerId);
  },

  async submitReview(payload: {
    booking_id: string;
    rating: number;
    comment: string;
    punctuality_rating?: number;
    quality_rating?: number;
    cleanliness_rating?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to submit review.', err);
    }
    return res.json();
  },

  async replyToReview(reviewId: string, reply: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ worker_reply: reply }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to post reply.', err);
    }
    return res.json();
  }
};

// ---------------------------------------------------------------------------
// 6. Platform Administration Service
// ---------------------------------------------------------------------------
export const adminService = {
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/stats/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to fetch platform stats.', err);
    }
    return res.json();
  },

  async getUsers(params?: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE_URL}/admin/users/?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch users.');
    return res.json();
  },

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to update user status.', err);
    }
    return res.json();
  },

  async getWorkers(params?: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE_URL}/admin/workers/?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch workers queue.');
    return res.json();
  },

  async verifyWorker(workerId: string, isVerified: boolean, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/verify/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_verified: isVerified, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to verify worker.', err);
    }
    return res.json();
  },

  async getBookings(params?: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE_URL}/admin/bookings/?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch bookings.');
    return res.json();
  },

  async mediatePrice(bookingId: string, payload: {
    action: 'cap_price' | 'warn_worker' | 'cancel_predatory';
    new_price?: number;
    reason: string;
    regulatory_note?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/mediate-price/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, err.detail || 'Failed to mediate booking price.', err);
    }
    return res.json();
  },

  async moderateReview(reviewId: string, isPublic: boolean, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/moderate/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_public: isPublic, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, 'Failed to moderate review.', err);
    }
    return res.json();
  },

  async getAuditLogs(params?: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs/?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new ApiError(res.status, 'Failed to fetch audit logs.');
    return res.json();
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
