-- Add created_at to monster for suggestion timestamps
ALTER TABLE monster ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
