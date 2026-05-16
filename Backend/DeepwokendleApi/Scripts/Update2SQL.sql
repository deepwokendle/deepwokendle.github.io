-- Votes and reports for pending monster suggestions

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
