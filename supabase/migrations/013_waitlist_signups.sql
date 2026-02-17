-- ============================================
-- Waitlist signups for CarrierScout
-- Stores every signup locally so admin can see them
-- ============================================

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company TEXT,
  user_type TEXT,
  dot_number TEXT,
  mc_number TEXT,
  source TEXT DEFAULT 'waitlist',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_signups(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist_signups(created_at DESC);

ALTER TABLE waitlist_signups DISABLE ROW LEVEL SECURITY;
