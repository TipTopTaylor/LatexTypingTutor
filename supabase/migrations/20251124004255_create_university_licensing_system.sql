/*
  # University Licensing System - Complete Authentication & Paywall Setup

  ## Overview
  Creates a comprehensive university licensing system with self-service student registration,
  seat-based licensing, and paywall enforcement for premium content.

  ## 1. New Tables

  ### `university_licenses`
  - `id` (uuid, primary key) - Unique license identifier
  - `university_name` (text) - Full name of the university
  - `email_domain` (text, unique) - Approved email domain (e.g., 'umich.edu')
  - `total_seats` (integer) - Number of paid seats
  - `used_seats` (integer) - Currently active users
  - `is_active` (boolean) - License active status
  - `created_at` (timestamptz) - License creation date
  - `expires_at` (timestamptz) - License expiration date

  ### `user_profiles`
  - `id` (uuid, primary key, references auth.users) - Links to Supabase auth
  - `email` (text) - User email address
  - `university_domain` (text) - Extracted domain from email
  - `license_id` (uuid, references university_licenses) - Associated license
  - `has_premium_access` (boolean) - Premium content access flag
  - `is_university_admin` (boolean) - University admin privileges
  - `created_at` (timestamptz) - Profile creation date
  - `last_active` (timestamptz) - Last activity timestamp

  ### `user_progress`
  - `id` (uuid, primary key) - Progress record identifier
  - `user_id` (uuid, references user_profiles) - User reference
  - `level_id` (text) - Level identifier
  - `completed` (boolean) - Level completion status
  - `score` (integer) - Level score
  - `completed_at` (timestamptz) - Completion timestamp

  ## 2. Security Features
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - University admins can view their institution's users
  - Public read access to active university licenses for domain verification

  ## 3. Business Logic
  - Free tier: Tutorial mode and Levels 1-2
  - Premium tier: Levels 3+ (requires university license or premium access)
  - Automatic seat counting via database triggers
  - Domain validation on signup
  - Seat limit enforcement

  ## 4. Functions & Triggers
  - `update_used_seats()` - Automatically updates seat count when users are added/removed
  - Trigger on user_profiles for seat management
*/

-- Create university_licenses table
CREATE TABLE IF NOT EXISTS university_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  email_domain text UNIQUE NOT NULL,
  total_seats integer NOT NULL DEFAULT 0,
  used_seats integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT positive_seats CHECK (total_seats >= 0),
  CONSTRAINT used_seats_check CHECK (used_seats >= 0 AND used_seats <= total_seats)
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  university_domain text,
  license_id uuid REFERENCES university_licenses(id) ON DELETE SET NULL,
  has_premium_access boolean DEFAULT false,
  is_university_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  level_id text NOT NULL,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, level_id)
);

-- Enable Row Level Security
ALTER TABLE university_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for university_licenses
CREATE POLICY "Public can view active licenses"
  ON university_licenses FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "University admins can view their license"
  ON university_licenses FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT license_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_university_admin = true
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "University admins can view their institution users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    license_id IN (
      SELECT license_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_university_admin = true
    )
  );

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update used_seats automatically
CREATE OR REPLACE FUNCTION update_used_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.license_id IS NOT NULL THEN
    UPDATE university_licenses
    SET used_seats = used_seats + 1
    WHERE id = NEW.license_id;
  ELSIF TG_OP = 'DELETE' AND OLD.license_id IS NOT NULL THEN
    UPDATE university_licenses
    SET used_seats = used_seats - 1
    WHERE id = OLD.license_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.license_id IS DISTINCT FROM OLD.license_id THEN
    IF OLD.license_id IS NOT NULL THEN
      UPDATE university_licenses
      SET used_seats = used_seats - 1
      WHERE id = OLD.license_id;
    END IF;
    IF NEW.license_id IS NOT NULL THEN
      UPDATE university_licenses
      SET used_seats = used_seats + 1
      WHERE id = NEW.license_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update used_seats
DROP TRIGGER IF EXISTS update_used_seats_trigger ON user_profiles;
CREATE TRIGGER update_used_seats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_used_seats();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_license ON user_profiles(license_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_domain ON user_profiles(university_domain);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_university_licenses_domain ON university_licenses(email_domain);

-- Insert sample university licenses for testing
INSERT INTO university_licenses (university_name, email_domain, total_seats, is_active, expires_at)
VALUES 
  ('Demo University', 'demo.edu', 100, true, now() + interval '1 year'),
  ('Test College', 'test.edu', 50, true, now() + interval '1 year')
ON CONFLICT (email_domain) DO NOTHING;