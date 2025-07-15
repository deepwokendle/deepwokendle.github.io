create table if not exists category (
	Id SERIAL primary key,
	Name varchar(150) not null
);

create table if not exists element (
	Id SERIAL primary key,
	Name varchar(150) not null
);

create table if not exists location (
	Id SERIAL primary key,
	Name varchar(150) not null
);

create table if not exists loot_category (
	Id SERIAL primary key,
	Name varchar(150) not null
);

create table if not exists loot (
	Id SERIAL primary key,
	Name varchar(150) not null,
	CategoryId integer,
	constraint FK_LOOT_LOOT_CATEGORY foreign key (CategoryId) references loot_category(Id)
);

create table if not exists monster(
	Id SERIAL primary key,
	Name varchar(150) not null,
	Picture varchar(500) not null,
	MainHabitat varchar(500) null,
    Humanoid boolean not null default false,
	ElementId integer not null,
	CategoryId integer not null,
	constraint FK_MONSTER_ELEMENT foreign key (ElementId) references element(Id),
	constraint FK_MONSTER_CATEGORY foreign key (CategoryId) references category(Id)
);


create table if not exists monster_loot (
    MonsterId integer references monster(id),
    LootId integer references loot(id),
    primary key (MonsterId, LootId)
);

create table if not exists monster_location (
    MonsterId integer references monster(id),
    LocationId integer references location(id),
    primary key (MonsterId, LocationId)
);


INSERT INTO loot_category (id, name) VALUES
  (1, 'Monster Parts'),
  (2, 'Equipment'),
  (3, 'Monster Mantras'),
  (4, 'Weapons'),
  (5, 'Armour Blueprints'),
  (6, 'Food'),
  (7, 'MISC'),
  (8, 'Chest');

INSERT INTO loot (id, name, categoryid) VALUES
  (1,  'Megalodaunt Hide',           1),
  (2,  'Thresher Spine',             1),
  (3,  'Void/Dark Feather',          1),
  (4,  'Odd Tentacle',               1),
  (5,  'Lionfish Scale',             1),
  (6,  'Megalodaunt Coat',           2),
  (7,  'Equipment',                  2),
  (8,  'Thresher Talon',             3),
  (9,  'Nautilodaunt Beak',          3),
  (10, 'Megalodaunt Coral',          3),
  (11, 'Giant Femur',                3),
  (12, 'Dread Serpent''s Tooth',     3),
  (13, 'Coral Cestus',               4),
  (14, 'Heavy Weapons',              4),
  (15, 'Weapons',                    4),
  (16, 'Armour Blueprints',          5),
  (17, 'Jet Black Justicar Defender Coat', 5),
  (18, 'Food',                       6),
  (19, 'Mantra Modifiers',           7),
  (20, 'Attunement Stones',          7),
  (21, 'Unbound Stat',               7),
  (22, 'MISC',                       7),
  (24, 'Knowledge',                  7),
  (26, 'Quest Item',                 7),
  (23, 'Chest',                      8),
  (25, 'Many Chests',                8);

INSERT INTO location (id, name) VALUES
(1, 'The Depths'),
(2, 'Etris'),
(3, 'Erisia'),
(4, 'The Songseeker Wilds'),
(5, 'Crypt of the Unbroken'),
(6, 'Layer 2'),
(7, 'The Voidsea'),
(8, 'Starswept Valley'),
(9, 'Viper''s Jaw'),
(10, 'Boatman''s Watch'),
(11, 'The Etrean Sea'),
(12, 'Monkey''s Paw'),
(13, 'The Aratel Sea');

INSERT INTO element (id, name) VALUES
(1, 'None'),
(2, 'Galebreathe'),
(3, 'Shadowcaster'),
(4, 'Thundercall'),
(5, 'Frostdraw'),
(6, 'Bloodrend'),
(7, 'Ironsing'),
(8, 'Attunementless'),
(9, 'Unknown');

INSERT INTO category (id, name) VALUES
(1, 'None'),
(2, 'Monster'),
(3, 'Interactable NPC'),
(4, 'Boss'),
(5, 'Unknown'),
(6, 'Hostile NPC');

INSERT INTO monster (name, picture, humanoid, elementid, categoryid) VALUES
('Sharko',              '/img/sharko.png',              false, 1, 2),
('Akira',               '/img/akira.png',               true,  5, 3),
('Owl',                 '/img/owl.png',                 false, 3, 2),
('Chaser',              '/img/chaser.jpg',              true,  6, 4),
('Duke Erisia',         '/img/duke.jpg',                true,  2, 4),
('Lord Regent',         '/img/regent.jpg',              true,  3, 3),
('Ferryman',            '/img/Ferryman.jpg',            true,  4, 4),
('Yun ''Shul',            '/img/yunshul.jpg',             false, 9, 3),
('Mudskipper',          '/img/mudskipper.jpg',          false, 1, 2),
('Lower Bandit',        '/img/BanditNormal.webp',       true,  8, 6),
('Thresher',            '/img/Thresher.webp',           false, 1, 2),
('Nautilodaunt',        '/img/nautilodaunt.jpg',        false, 1, 2),
('Gigamed',             '/img/Gigamed.jpg',             false, 4, 2),
('Bone Keeper',         '/img/BoneKeeper.jpg',          false, 1, 2),
('Mudskipper Broodlord','/img/MudskipperBroodlord.jpg', false, 1, 2),
('Enforcer',            '/img/Swordforcer.webp',        false, 1, 2),
('Scion of Ethiron',    '/img/Ethiron.jpg',             false, 2, 4),
('Lionfish',            '/img/Lionfish.jpg',            false, 1, 2),
('Dread Serpent',       '/img/DreadSerpent.jpg',        false, 1, 2),
('Klaris Llfiend',      '/img/klaris.jpg',              true,  9, 3),
('The Meat Lord',       '/img/TheMeatLord.jpg',         true,  9, 3),
('Karliah',             '/img/Karliah.webp',            true,  1, 3),
('Immortal Guardian',   '/img/IMMGUARD.webp',           true,  1, 6),
('Primadon',            '/img/Primadon.webp',           false, 1, 4),
('Kennith',             '/img/Kennith.webp',            true,  1, 3);

select * from monster

INSERT INTO monster_loot (monsterid, lootid) VALUES
(1, 1),
(1, 19),
(1, 20),

(2, 21),
(2, 22),

(3, 3),
(3, 17),

(4, 21),
(4, 22),
(4, 23),
(4, 24),

(5, 21),
(5, 22),
(5, 23),
(5, 24),

(6, 22),
(6, 26),

(7, 25),
(7, 24),

(8, 22),

(9, 19),
(9, 20),

(10, 19),

(11, 2),
(11, 19),
(11, 20),
(11, 8),

(12, 4),
(12, 9),
(12, 16),

(13, 20),

(14, 11),
(14, 24),

(15, 19),
(15, 13),
(15, 16),

(16, 19),
(16, 14),

(17, 23),
(17, 24),

(18, 5),
(18, 19),

(19, 7),
(19, 22),
(19, 12),

(20, 22),
(20, 24),

(21, 18),
(21, 22),

(22, 21),
(22, 22),

(23, 19),
(23, 7),

(24, 21),
(24, 22),
(24, 24),
(24, 25),

(25, 22),
(25, 26);

INSERT INTO monster_location (monsterid, locationid) VALUES
(1, 1),
(1, 3),
(1, 11),

(2, 1),

(3, 1),
(3, 3),
(3, 9),

(4, 6),

(5, 3),

(6, 2),

(7, 10),
(7, 7),

(8, 1),

(9, 1),
(9, 4),
(9, 3),

(10, 3),

(11, 1),
(11, 8),

(12, 1),

(13, 1),

(14, 6),

(15, 1),
(15, 13),

(16, 1),

(17, 6),

(18, 1),
(18, 13),
(18, 7),

(19, 7),

(20, 1),

(21, 8),

(22, 2),

(23, 5),

(24, 12),
(24, 7),

(25, 2),
(25, 6);


CREATE TABLE Users (
    Id SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'User'
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO Users (Username, PasswordHash, Role)
VALUES (
  'Admin',
  crypt('!Abc308', gen_salt('bf')),
  'Admin'
);
