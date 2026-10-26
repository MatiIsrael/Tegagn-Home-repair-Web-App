-- ============================================================================
-- TEGAGN SUPABASE DATABASE INITIALIZATION SCHEMA (IDEMPOTENT & FIXED)
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('customer', 'worker', 'admin')) DEFAULT 'customer',
  phone_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Automatic profile sync trigger from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, phone_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(new.raw_user_meta_data->>'phone_number', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. WORKER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  trade TEXT NOT NULL,
  trade_title TEXT,
  hourly_rate NUMERIC(10, 2) DEFAULT 350.00,
  experience_years INT DEFAULT 3,
  city TEXT DEFAULT 'Addis Ababa',
  subcity TEXT,
  bio TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  reviews_count INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  verified BOOLEAN DEFAULT TRUE,
  badge_level TEXT DEFAULT 'pro',
  service_areas TEXT[] DEFAULT ARRAY['Addis Ababa'],
  skills TEXT[] DEFAULT ARRAY['General Repair'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Worker profiles viewable by everyone" ON public.worker_profiles;
CREATE POLICY "Worker profiles viewable by everyone" 
  ON public.worker_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Workers can update own worker profile" ON public.worker_profiles;
CREATE POLICY "Workers can update own worker profile" 
  ON public.worker_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers can insert own worker profile" ON public.worker_profiles;
CREATE POLICY "Workers can insert own worker profile" 
  ON public.worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  starting_rate NUMERIC(10, 2) DEFAULT 300.00,
  is_popular BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  worker_name TEXT NOT NULL,
  worker_trade TEXT NOT NULL,
  service_description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  estimated_cost NUMERIC(10, 2) DEFAULT 500.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
CREATE POLICY "Anyone can view bookings" 
  ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert booking" ON public.bookings;
CREATE POLICY "Anyone can insert booking" 
  ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update booking" ON public.bookings;
CREATE POLICY "Users can update booking" 
  ON public.bookings FOR UPDATE USING (true);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_rendered TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert review" ON public.reviews;
CREATE POLICY "Anyone can insert review" 
  ON public.reviews FOR INSERT WITH CHECK (true);

-- 6. Initial Trades & Categories Seed Data (Column counts matching exactly)
INSERT INTO public.categories (slug, name, description, icon, starting_rate, is_popular)
VALUES
  ('electrician', 'Electrician', 'Wiring, breakers, lighting, appliance installation', 'Zap', 400.00, true),
  ('plumber', 'Plumbing', 'Pipe fitting, leaks, drainage, water heater installation', 'Droplets', 380.00, true),
  ('carpenter', 'Carpentry', 'Custom woodwork, cabinetry, door/window frame fitting', 'Hammer', 350.00, true),
  ('painter', 'Painting & Decor', 'Interior & exterior painting, plastering, decorative finishes', 'Paintbrush', 300.00, true),
  ('mason', 'Masonry & Tiling', 'Stone work, tile laying, foundation repairs, concrete finishing', 'Boxes', 420.00, true),
  ('appliance-repair', 'Appliance Repair', 'Refrigerators, washing machines, ovens, TV mounting', 'Wrench', 360.00, true)
ON CONFLICT (slug) DO NOTHING;
