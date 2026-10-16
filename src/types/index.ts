/**
 * TypeScript Interfaces & Types for Tegagn Marketplace
 * Designed for seamless integration with Django REST Framework backend
 */

export type UserRole = 'customer' | 'worker' | 'admin';

export type TradeCategory = 
  | 'plumber'
  | 'electrician'
  | 'construction'
  | 'builder'
  | 'painter'
  | 'carpenter'
  | 'cleaning'
  | 'hvac'
  | 'locksmith'
  | 'roofer'
  | 'gardener';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  dateJoined?: string;
}

export interface Category {
  id: string;
  slug: TradeCategory;
  name: string;
  iconName: string;
  description: string;
  workerCount: number;
  popularServices: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface Review {
  id: string;
  workerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  jobType: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  user: User;
  trade: TradeCategory;
  tradeTitle: string;
  hourlyRate: number;
  experienceYears: number;
  bio: string;
  city: string;
  serviceAreas: string[];
  skills: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  completedJobs: number;
  certifications: string[];
  portfolio: PortfolioItem[];
  reviews?: Review[];
}

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  serviceDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
    label?: string;
  };
  status: BookingStatus;
  estimatedCost: number;
  createdAt: string;
  notes?: string;
}

export interface WorkerPostComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar?: string;
  comment: string;
  createdAt: string;
}

export interface WorkerPost {
  id: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  workerAvatar: string;
  workerRating?: number;
  workerHourlyRate?: number;
  workerExperience?: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  priceCharged: number;
  currency: string;
  duration: string;
  location: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
    label?: string;
  };
  likesCount: number;
  isLiked?: boolean;
  comments: WorkerPostComment[];
  createdAt: string;
}

export interface WorkerServiceItem {
  id: string;
  workerId: string;
  title: string;
  category: TradeCategory;
  description: string;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  price: number;
  durationEstimate?: string;
  isActive: boolean;
}

export interface WorkerFilterParams {
  search?: string;
  category?: string;
  city?: string;
  minRating?: number;
  maxHourlyRate?: number;
  isAvailable?: boolean;
  isVerified?: boolean;
  sortBy?: 'rating_desc' | 'price_asc' | 'price_desc' | 'experience_desc';
}

export interface PlatformStat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}
