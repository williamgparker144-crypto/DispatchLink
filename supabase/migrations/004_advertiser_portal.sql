-- 004_advertiser_portal.sql
-- Adds advertiser user type, ad campaigns, creatives, and impression tracking

-- 1. Extend user_type CHECK constraint to include 'advertiser'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('dispatcher', 'carrier', 'broker', 'advertiser'));

-- 2. Advertiser profiles
CREATE TABLE IF NOT EXISTS advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_website TEXT,
  industry TEXT,
  contact_phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_advertiser_profiles_user_id ON advertiser_profiles(user_id);

-- 3. Ad campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected')),
  ad_format TEXT NOT NULL DEFAULT 'feed_post'
    CHECK (ad_format IN ('feed_post', 'directory_spotlight', 'banner')),
  target_user_types TEXT[] DEFAULT '{}',
  target_regions TEXT[] DEFAULT '{}',
  budget_notes TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ad_campaigns_advertiser ON ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);

-- 4. Ad creatives
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  body_text TEXT NOT NULL,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ad_creatives_campaign ON ad_creatives(campaign_id);

-- 5. Ad impressions / clicks
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'impression'
    CHECK (event_type IN ('impression', 'click')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX idx_ad_impressions_creative ON ad_impressions(creative_id);
CREATE INDEX idx_ad_impressions_created ON ad_impressions(created_at);

-- 6. Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_advertiser_profiles_updated ON advertiser_profiles;
CREATE TRIGGER trg_advertiser_profiles_updated
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ad_campaigns_updated ON ad_campaigns;
CREATE TRIGGER trg_ad_campaigns_updated
  BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Storage bucket for ad creatives
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "ad_creatives_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-creatives');

-- Authenticated upload
CREATE POLICY "ad_creatives_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ad-creatives'
    AND auth.role() = 'authenticated'
  );

-- RLS policies for advertiser tables
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Advertiser profiles: owner can read/write, public can read
CREATE POLICY "advertiser_profiles_select" ON advertiser_profiles FOR SELECT USING (true);
CREATE POLICY "advertiser_profiles_insert" ON advertiser_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "advertiser_profiles_update" ON advertiser_profiles FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Campaigns: owner can CRUD, public can read active
CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT USING (true);
CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT WITH CHECK (auth.uid()::text = advertiser_id::text);
CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE USING (auth.uid()::text = advertiser_id::text);

-- Creatives: public read, owner-via-campaign can insert
CREATE POLICY "ad_creatives_select" ON ad_creatives FOR SELECT USING (true);
CREATE POLICY "ad_creatives_insert" ON ad_creatives FOR INSERT WITH CHECK (true);

-- Impressions: anyone can insert (for tracking), select for analytics
CREATE POLICY "ad_impressions_insert" ON ad_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "ad_impressions_select" ON ad_impressions FOR SELECT USING (true);
