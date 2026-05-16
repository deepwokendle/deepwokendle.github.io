-- Add updated_at to track suggestion edits
ALTER TABLE monster ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NULL;
