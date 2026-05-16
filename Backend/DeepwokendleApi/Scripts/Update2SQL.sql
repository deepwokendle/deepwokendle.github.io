ALTER TABLE monster ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE monster ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NULL;
CREATE TABLE IF NOT EXISTS chat_message (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(36) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_report (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL REFERENCES chat_message(id),
    reported_by VARCHAR(100) NOT NULL,
    reported_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, reported_by)
);

CREATE TABLE IF NOT EXISTS monster_vote (
    monster_id INTEGER NOT NULL REFERENCES monster(id) ON DELETE CASCADE,
    username   VARCHAR(100) NOT NULL,
    vote       SMALLINT NOT NULL,
    PRIMARY KEY (monster_id, username)
);

CREATE TABLE IF NOT EXISTS monster_report (
    monster_id INTEGER NOT NULL REFERENCES monster(id) ON DELETE CASCADE,
    username   VARCHAR(100) NOT NULL,
    PRIMARY KEY (monster_id, username)
);
