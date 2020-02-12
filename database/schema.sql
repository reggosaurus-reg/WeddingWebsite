CREATE TABLE IF NOT EXISTS "Wish"
(
    [name] NVARCHAR(100) PRIMARY KEY NOT NULL,
    [description] NVARCHAR(100) NOT NULL,
    [nr_wished] INTEGER NOT NULL,
    [nr_reserved] INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Person"
(
    [name] NVARCHAR(100) PRIMARY KEY NOT NULL,
    [info] NVARCHAR(500),
	[gluten] BOOL DEFAULT FALSE,
	[laktos] BOOL DEFAULT FALSE,
	[vegetarian] BOOL DEFAULT FALSE,
	[vegan] BOOL DEFAULT FALSE,
    [other_allergy] NVARCHAR(100)
);
