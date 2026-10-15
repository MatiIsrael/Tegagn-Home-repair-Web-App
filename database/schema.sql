-- ============================================================================
-- TEGAGN HOME-REPAIR MARKETPLACE
-- PRODUCTION-READY POSTGRESQL DATABASE SCHEMA SPECIFICATION
-- ============================================================================
-- Notice: This script defines the complete relational schema, indexes, 
-- constraints, triggers, and security policies for Tegagn.
-- Execution requires administrative approval.
-- ============================================================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";      -- Case-insensitive text for emails

-- 2. ENUMS & DOMAINS
CREATE TYPE user_role_enum AS ENUM ('customer', 'worker', 'admin', 'moderator');
CREATE TYPE trade_category_enum AS ENUM (
    'plumber',
    'electrician',
    'builder',
    'painter',
    'carpenter',
    'cleaner',
    'hvac',
    'locksmith',
    'roofer',
    'general'
);
CREATE TYPE booking_status_enum AS ENUM (
    'pending',
    'accepted',
    'declined',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
);
CREATE TYPE notification_type_enum AS ENUM (
    'booking_requested',
    'booking_accepted',
    'booking_declined',
    'booking_started',
    'booking_completed',
    'booking_cancelled',
    'new_review',
    'system_announcement'
);
CREATE TYPE audit_action_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'STATUS_CHANGE',
    'VERIFICATION_APPROVED',
    'VERIFICATION_REJECTED',
    'SUSPENSION'
);

-- ============================================================================
-- 3. TABLES DEFINITION
-- ============================================================================

-- Table: users
-- Core authentication and identity table. Stores one credential per human user.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    avatar_url TEXT,
    city VARCHAR(80) NOT NULL DEFAULT 'Addis Ababa',
    address_line TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_phone_format CHECK (phone_number ~ '^\+?[0-9]{9,15}$')
);

-- Table: roles & user_roles
-- Enables a single user to be a customer, worker, and/or admin without duplicate accounts.
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name user_role_enum NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Table: service_categories
-- Canonical trade categories (Plumbing, Electrical, Carpentry, etc.)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL UNIQUE,
    trade_key trade_category_enum NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: worker_profiles
-- Trade professional profiles linked 1-to-1 to users.
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    primary_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    trade_title VARCHAR(120) NOT NULL,
    bio TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 1,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ETB',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_emergency_ready BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT[] NOT NULL DEFAULT '{}',
    certifications TEXT[] NOT NULL DEFAULT '{}',
    rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    completed_jobs_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_worker_hourly_rate CHECK (hourly_rate >= 0),
    CONSTRAINT chk_worker_experience CHECK (experience_years BETWEEN 0 AND 60),
    CONSTRAINT chk_worker_rating CHECK (rating_average BETWEEN 0.00 AND 5.00),
    CONSTRAINT chk_worker_currency CHECK (currency IN ('ETB', 'USD', 'EUR'))
);

-- Table: worker_services
-- Specific services with individual pricing offered by a worker.
CREATE TABLE worker_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ETB',
    price_type VARCHAR(20) NOT NULL DEFAULT 'fixed', -- 'fixed', 'hourly', 'starting_at'
    estimated_duration_minutes INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_service_price CHECK (price >= 0),
    CONSTRAINT chk_price_type CHECK (price_type IN ('fixed', 'hourly', 'starting_at')),
    CONSTRAINT chk_service_currency CHECK (currency IN ('ETB', 'USD', 'EUR')),
    CONSTRAINT uq_worker_service_title UNIQUE (worker_id, title)
);

-- Table: bookings
-- Core marketplace transaction linking customer, worker, and requested service.
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(16) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES worker_services(id) ON DELETE SET NULL,
    status booking_status_enum NOT NULL DEFAULT 'pending',
    service_title VARCHAR(120) NOT NULL,
    service_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    service_address TEXT NOT NULL,
    service_city VARCHAR(80) NOT NULL DEFAULT 'Addis Ababa',
    customer_notes TEXT,
    agreed_price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ETB',
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_price CHECK (agreed_price >= 0),
    CONSTRAINT chk_booking_currency CHECK (currency IN ('ETB', 'USD', 'EUR'))
);

-- Table: booking_status_history
-- Immutable audit ledger tracking every state transition of a booking.
CREATE TABLE booking_status_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status booking_status_enum,
    to_status booking_status_enum NOT NULL,
    changed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: reviews
-- Customer feedback on completed bookings. Strictly 1-to-1 with booking.
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    punctuality_rating INT,
    quality_rating INT,
    cleanliness_rating INT,
    worker_reply TEXT,
    worker_replied_at TIMESTAMPTZ,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_overall_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_punctuality_rating CHECK (punctuality_rating IS NULL OR punctuality_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_quality_rating CHECK (quality_rating IS NULL OR quality_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_cleanliness_rating CHECK (cleanliness_rating IS NULL OR cleanliness_rating BETWEEN 1 AND 5)
);

-- Table: notifications
-- User notification inbox for booking events, reviews, and status changes.
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: audit_logs
-- Immutable security and administrative audit log for compliance.
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action audit_action_enum NOT NULL,
    resource_type VARCHAR(60) NOT NULL, -- 'WorkerProfile', 'Booking', 'User', etc.
    resource_id VARCHAR(64) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    previous_state JSONB,
    new_state JSONB,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. PERFORMANCE & SEARCH INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;

-- Worker Profiles
CREATE INDEX idx_worker_profiles_category ON worker_profiles(primary_category_id);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(is_available, is_emergency_ready);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating_average DESC);
CREATE INDEX idx_worker_profiles_city ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_search ON worker_profiles(primary_category_id, is_available, hourly_rate);

-- Worker Services
CREATE INDEX idx_worker_services_worker ON worker_services(worker_id);
CREATE INDEX idx_worker_services_category ON worker_services(category_id);
CREATE INDEX idx_worker_services_active ON worker_services(worker_id, is_active);

-- Bookings
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_worker_schedule ON bookings(worker_id, scheduled_date, status);
CREATE INDEX idx_bookings_ref ON bookings(reference_number);

-- Reviews
CREATE INDEX idx_reviews_worker ON reviews(worker_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- 5. TRIGGERS & PROCEDURES FOR CONSISTENCY
-- ============================================================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_service_categories
BEFORE UPDATE ON service_categories
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_worker_profiles
BEFORE UPDATE ON worker_profiles
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_worker_services
BEFORE UPDATE ON worker_services
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reviews
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to re-aggregate Worker Profile rating after a review is inserted or updated
CREATE OR REPLACE FUNCTION recalculate_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_worker_id UUID;
    new_avg NUMERIC(3, 2);
    total_rev INT;
BEGIN
    target_worker_id := NEW.worker_id;

    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
        COUNT(*)
    INTO new_avg, total_rev
    FROM reviews
    WHERE worker_id = target_worker_id AND is_public = TRUE;

    UPDATE worker_profiles
    SET 
        rating_average = new_avg,
        reviews_count = total_rev,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_worker_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_review_update
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalculate_worker_rating();

-- Trigger to record booking status transitions in booking_status_history
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO booking_status_history (
            booking_id,
            from_status,
            to_status,
            changed_by_user_id,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE(NEW.cancelled_by_user_id, NEW.customer_id),
            NEW.cancellation_reason
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_status_log
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- ============================================================================
-- 6. SEED DATA (STANDARD ROLES & INITIAL TRADE CATEGORIES)
-- ============================================================================

INSERT INTO roles (name, description) VALUES
    ('customer', 'Default role for clients requesting home repairs and bookings'),
    ('worker', 'Trade professional providing specialized repair and maintenance services'),
    ('admin', 'Marketplace administrator managing users, disputes, and compliance'),
    ('moderator', 'Moderator managing reviews, flags, and catalog classifications')
ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (slug, name, trade_key, description, icon_name, display_order) VALUES
    ('plumbing', 'Plumbing Services', 'plumber', 'Pipe leaks, water heaters, drain unclogging, and fixtures.', 'Wrench', 1),
    ('electrical', 'Electrical Work', 'electrician', 'Wiring, breakers, lighting installation, and diagnostics.', 'Zap', 2),
    ('carpentry', 'Carpentry & Woodwork', 'carpenter', 'Custom furniture, door fittings, cabinetry, and structural framing.', 'Hammer', 3),
    ('painting', 'Painting & Finishing', 'painter', 'Interior and exterior painting, drywall finishing, and weatherproofing.', 'Paintbrush', 4),
    ('construction', 'Masonry & Construction', 'builder', 'Wall construction, tile setting, concrete repair, and plastering.', 'HardHat', 5),
    ('cleaning', 'Deep Cleaning & Sanitization', 'cleaner', 'Post-renovation cleanup, residential deep cleaning, and sanitization.', 'Sparkles', 6)
ON CONFLICT (slug) DO NOTHING;
