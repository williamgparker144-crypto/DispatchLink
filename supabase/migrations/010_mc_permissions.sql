-- 010_mc_permissions.sql
-- MC# agent authorization permissions between carriers and dispatchers
-- Dispatchers act as agents for carriers who explicitly grant them MC# access

CREATE TABLE IF NOT EXISTS mc_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dispatcher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL DEFAULT 'loadboard_access',
  consent_signature TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'expired')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mc_permissions_carrier ON mc_permissions(carrier_id);
CREATE INDEX idx_mc_permissions_dispatcher ON mc_permissions(dispatcher_id);
CREATE INDEX idx_mc_permissions_status ON mc_permissions(status);

-- Prevent duplicate active permissions for the same carrier-dispatcher pair
CREATE UNIQUE INDEX idx_mc_permissions_unique_active
  ON mc_permissions(carrier_id, dispatcher_id) WHERE status = 'active';

-- Row Level Security
ALTER TABLE mc_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mc_permissions_select" ON mc_permissions
  FOR SELECT USING (true);

CREATE POLICY "mc_permissions_insert" ON mc_permissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "mc_permissions_update" ON mc_permissions
  FOR UPDATE USING (true);
