PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "Wishlist"
(
    [name] NVARCHAR(100) PRIMARY KEY NOT NULL,
    [description] NVARCHAR(100),
	[cathegory] NVARCHAR(100) NOT NULL,
	[url] NVARCHAR(200),
    [nr_wished] INTEGER NOT NULL,
    [nr_to_buy] INTEGER NOT NULL,
	FOREIGN KEY(cathegory) REFERENCES Cathegory(name)
);

CREATE TABLE IF NOT EXISTS "Cathegory"
(
	[name] NVARCHAR(100) PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "Person"
(
	[time] DATETIME DEFAULT CURRENT_TIMESTAMP,
    [name] NVARCHAR(100) PRIMARY KEY NOT NULL,
    [email] NVARCHAR(100),
	[gluten] BOOL DEFAULT FALSE,
	[laktos] BOOL DEFAULT FALSE,
	[vegetarian] BOOL DEFAULT FALSE,
	[vegan] BOOL DEFAULT FALSE,
    [allergy] NVARCHAR(200),
    [info] NVARCHAR(500)
);
