-- Add gallery_images column to users table for persisting gallery URLs
ALTER TABLE users ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';
