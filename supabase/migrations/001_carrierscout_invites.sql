-- CarrierScout Invitations Table
-- Reference schema for the carrierscout_invites table
-- Apply via databasepad.com admin panel or Supabase CLI

CREATE TABLE IF NOT EXISTS carrierscout_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatcher_id TEXT NOT NULL,
  carrier_name TEXT NOT NULL,
  carrier_mc_number TEXT NOT NULL,
  invite_email TEXT NOT NULL,
  invite_phone TEXT,
  invite_method TEXT DEFAULT 'email',
  personal_message TEXT,
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for looking up invites by dispatcher
CREATE INDEX IF NOT EXISTS idx_carrierscout_invites_dispatcher
  ON carrierscout_invites(dispatcher_id);

-- Index for looking up invites by status
CREATE INDEX IF NOT EXISTS idx_carrierscout_invites_status
  ON carrierscout_invites(status);

-- Index for looking up invites by MC number (to check if already invited)
CREATE INDEX IF NOT EXISTS idx_carrierscout_invites_mc
  ON carrierscout_invites(carrier_mc_number);
