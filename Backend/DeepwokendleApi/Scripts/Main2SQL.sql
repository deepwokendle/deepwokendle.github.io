
ALTER TABLE monster
ADD COLUMN useratcreation varchar(100);

ALTER TABLE monster
ADD COLUMN pending boolean NOT NULL DEFAULT false;



create table if not exists daily_monster (
	id SERIAL primary key,
	monster_id int not null,
	created_at date not null,
	constraint fk_daily_monster_monster foreign key (monster_id) references monster(id)
)

create table if not exists generated_monster (
	id serial primary key,
	monster_id int not null,
	user_at_creation varchar(255) not null,
	completed boolean not null default false,
	constraint fk_generated_monster_monster foreign key (monster_id) references monster(id)
);

create table if not exists attempts (
	id serial primary key,
	monster_id int not null,
	generated_monster_id int null,
	"user" varchar(255) not null,
	guess_date timestamp not null default now(),
	infinite boolean not null,
	correct boolean not null,
	constraint fk_attempts_monster foreign key (monster_id) references monster(id),
	constraint fk_attempts_generated_monster foreign key (generated_monster_id) references generated_monster(id)
);

ALTER TABLE monster
ADD COLUMN useratcreation varchar(100);

ALTER TABLE monster
ADD COLUMN pending boolean NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN max_streak int NULL DEFAULT 0;

ALTER TABLE users
ADD COLUMN curr_streak int NULL DEFAULT 0;

ALTER TABLE users
ADD COLUMN curr_streak int NULL DEFAULT 0;

INSERT INTO public.monster_loot (monsterid,lootid) VALUES
	 (45,23),
	 (45,24),
	 (45,21),
	 (45,15);

INSERT INTO monster_location (monsterid,locationid) VALUES
	 (45,14);