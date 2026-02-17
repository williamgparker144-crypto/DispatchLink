-- Profile views tracking table
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  view_date DATE DEFAULT CURRENT_DATE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_profile_views_viewed_user ON profile_views(viewed_user_id);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);

-- One view per viewer per viewed user per day (prevent spam)
CREATE UNIQUE INDEX idx_profile_views_unique_daily
  ON profile_views(viewed_user_id, viewer_id, view_date);

-- Disable RLS for serverless access
ALTER TABLE profile_views DISABLE ROW LEVEL SECURITY;
