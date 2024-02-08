CREATE TABLE IF NOT EXISTS MessageCount (
  id            INTEGER NOT NULL UNIQUE,
  isoDate      DATE NOT NULL,
	date          TEXT NOT NULL,
	chatId	      INTEGER NOT NULL,
  userId        INTEGER NOT NULL,
  messageCount  INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(date, chatId, userId)
);

CREATE TABLE IF NOT EXISTS Birthdays (
  id            INTEGER NOT NULL UNIQUE,
  date          TEXT NOT NULL,
  userId        INTEGER NOT NULL,
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(userId) 
)