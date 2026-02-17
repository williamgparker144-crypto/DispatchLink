-- Create storage buckets for avatars and ad creatives
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read and anon upload for avatars
DO $$ BEGIN
  CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Anon insert avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Anon update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow public read and anon upload for ad-creatives
DO $$ BEGIN
  CREATE POLICY "Public read ad-creatives" ON storage.objects FOR SELECT USING (bucket_id = 'ad-creatives');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Anon insert ad-creatives" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-creatives');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Anon update ad-creatives" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-creatives');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
