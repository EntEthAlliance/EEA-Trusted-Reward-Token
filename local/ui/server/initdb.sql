-- DROP TABLE public.users;
CREATE TABLE IF NOT EXISTS public.users (
	id serial NOT NULL,
	"name" varchar(100) NOT NULL,
	login varchar(30) NOT NULL,
	"role" varchar(10) NOT NULL,
	salt varchar(50) NOT NULL,
	pwdhash varchar(100) NOT NULL,
	parentid int4 NOT NULL,
	chainid varchar(50) NULL,
	regdate timestamp NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
-- admin:adminPwd
INSERT INTO public.users
(id, "name", login, "role", salt, pwdhash, chainid, parentid)
VALUES(1, 'Embeded Admin', 'admin', 'admin', 'salt13', 'bdb9e8c675977dc18cf5618f3d5f225f109236d1b2da0dd9d65fc915d8d7330a', '0x0000000000000000000000000000000000000000',0);

ALTER SEQUENCE users_id_seq RESTART WITH 100;


CREATE TABLE IF NOT EXISTS public.tokens (
	userid int4 NOT NULL,
	eeareward int4 NULL,
	eeareputation int4 NULL,
	eeapenalty int4 NULL,
	CONSTRAINT tokens_pkey PRIMARY KEY (userid)
);
ALTER TABLE public.tokens ADD CONSTRAINT tokens_userid_fkey FOREIGN KEY (userid) REFERENCES users(id);


--DROP TABLE  public.reward_reasons
CREATE TABLE IF NOT EXISTS  public.reward_reasons(
	id int not null, 
	name varchar(500), 
	token_count int);
INSERT INTO public.reward_reasons(id, "name", token_count)
VALUES
	(1, 'SIG/TWG/SC Meeting Participation', 10),
	(2, 'SIG/TWG/SC Meeting Chair', 5),
	(3, 'SIG/TWG/SC Meeting Written Contribution', 100),
	(4, 'SIG/TWG/SC Meeting  Main Editor of a Written Contribution', 200),
	(5, 'SIG/TWG/SC EEA Project Contributions (Development or Compute)',	1000),
	(6, 'SIG/TWG/SC EEA Project Manager or Highly Specialized Resource',		2000),
	(7, 'SIG/TWG/SC EEA Project Financial or Resource Sponsor', 	10000)	
;

--DROP TABLE public.list_redeemfor
CREATE TABLE IF NOT EXISTS public.list_redeemfor(
	id int not null, 
	name varchar(500), 
	tokencount int, 
	CONSTRAINT list_redeemfor_pkey PRIMARY KEY (id));
INSERT INTO public.list_redeemfor(id, "name", tokencount)
VALUES
	(1, 'EEA Shirt ', 10),
	(2, 'Dinner with Ron', 100),
	(3, 'Marley Autographed Shades', 1000)
;

--DROP TABLE public.request
CREATE TABLE IF NOT EXISTS public.request(
	id serial not null, 
	memberid int not null references public.users(id),
	tokencount int not null,
	regdate timestamp,
	completedate timestamp,
	requesttype varchar(50),
	redeemforid int null references public.list_redeemfor(id),
	redeemcount int null,
	sharetoid int null references public.users(id),
	iscomplete BOOLEAN,
	CONSTRAINT request_pkey PRIMARY KEY (id)
);

