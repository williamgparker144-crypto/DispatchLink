-- Add settings JSONB column to users table for privacy & notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
