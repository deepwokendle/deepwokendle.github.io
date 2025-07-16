insert into location (id, name) values
(14, 'Isle of Vigils'),
(15, 'Summer Isle')
update monster set categoryid = 4, elementid = 5 where id = 19
update monster set elementid = 2 where id = 9
insert into monster_location (monsterid, locationid) values
(11, 11),
(11, 13),
(21, 4),
(21, 15),
(21, 9),
(22, 3),
(10, 2),
(10, 14),
(10, 15);

insert into monster_loot (monsterid, lootid) values
(17, 22)