-- ==============================================================================
-- TEGAGN HOME-REPAIR MARKETPLACE - SUPABASE PRODUCTION POSTGRESQL SCHEMA
-- Run this in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  phone_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Worker Profiles Table
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  trade TEXT NOT NULL,
  trade_title TEXT NOT NULL,
  hourly_rate NUMERIC(10, 2) DEFAULT 350.00,
  experience_years INTEGER DEFAULT 3,
  bio TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  service_areas TEXT[] DEFAULT ARRAY['Addis Ababa'],
  is_verified BOOLEAN DEFAULT FALSE,
  license_number TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.90,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Worker Job Releases & Moderation Queue
CREATE TABLE IF NOT EXISTS public.worker_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price_charged NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  duration TEXT,
  location TEXT DEFAULT 'Addis Ababa',
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  is_price_flagged BOOLEAN DEFAULT FALSE,
  benchmark_price NUMERIC(10, 2),
  admin_feedback TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- 4. Bookings & Anti-Price-Gouging Mediation Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'price_mediated')),
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  agreed_price NUMERIC(10, 2) NOT NULL,
  benchmark_price NUMERIC(10, 2),
  is_high_price_flagged BOOLEAN DEFAULT FALSE,
  service_address TEXT NOT NULL,
  customer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Platform Regulatory Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  description TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Worker Posts: Approved posts viewable by everyone; Workers see their own; Admins see all
CREATE POLICY "Approved posts viewable by all" ON public.worker_posts FOR SELECT USING (
  approval_status = 'approved' OR 
  auth.uid() = worker_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Workers can insert posts" ON public.worker_posts FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Admins can update posts" ON public.worker_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = worker_id
);

-- Bookings: Customers and Workers can see their own bookings; Admins can mediate all
CREATE POLICY "Users view own bookings or admin" ON public.bookings FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() = worker_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
