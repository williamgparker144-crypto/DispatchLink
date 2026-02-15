-- 002_user_tables.sql
-- Core user tables for DispatchLink persistence

-- ============================================
-- Users table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('dispatcher', 'carrier', 'broker')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Dispatcher profiles
-- ============================================
CREATE TABLE IF NOT EXISTS dispatcher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  years_experience INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  carrier_scout_subscribed BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Carrier profiles
-- ============================================
CREATE TABLE IF NOT EXISTS carrier_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dot_number TEXT,
  mc_number TEXT,
  authority_status TEXT DEFAULT 'Pending Verification',
  equipment_types TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Broker profiles
-- ============================================
CREATE TABLE IF NOT EXISTS broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  mc_number TEXT,
  specialties TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Carrier references (dispatchers' carrier relationships)
-- ============================================
CREATE TABLE IF NOT EXISTS carrier_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatcher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  carrier_name TEXT NOT NULL,
  mc_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  agreement_file_url TEXT,
  agreement_file_name TEXT,
  agreement_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carrier_references_dispatcher
  ON carrier_references(dispatcher_user_id);

-- ============================================
-- updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['users', 'dispatcher_profiles', 'carrier_profiles', 'broker_profiles'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================
-- Storage buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('agreements', 'agreements', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (use DO block to avoid errors if already exist)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Authenticated upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Authenticated upload agreements" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'agreements');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END;
$$;
