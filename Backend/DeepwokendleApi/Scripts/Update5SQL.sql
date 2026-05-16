ALTER TABLE loot ADD COLUMN IF NOT EXISTS created_by_player BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE loot ADD COLUMN IF NOT EXISTS user_at_creation  VARCHAR(100) NULL;

ALTER TABLE location ADD COLUMN IF NOT EXISTS created_by_player BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE location ADD COLUMN IF NOT EXISTS user_at_creation  VARCHAR(100) NULL;

SELECT setval(pg_get_serial_sequence('loot',     'id'), COALESCE((SELECT MAX(id) FROM loot),     0));
SELECT setval(pg_get_serial_sequence('location', 'id'), COALESCE((SELECT MAX(id) FROM location), 0));
