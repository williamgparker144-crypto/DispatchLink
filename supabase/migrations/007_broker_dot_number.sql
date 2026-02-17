-- Add dot_number column to broker_profiles (matches carrier_profiles schema)
ALTER TABLE broker_profiles ADD COLUMN IF NOT EXISTS dot_number TEXT;
