-- Add auth_id and auth_provider to users table for Supabase Auth bridging
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Index for fast lookups by auth_id
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Safety check: add phone column if not exists
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
