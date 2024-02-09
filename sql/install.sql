CREATE TABLE IF NOT EXISTS MessageCount (
  id            INTEGER NOT NULL UNIQUE,
  timestamp     INTEGER NOT NULL,
	chatId	      INTEGER NOT NULL,
  userId        INTEGER NOT NULL,
  messageCount  INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(timestamp, chatId, userId)
); 

CREATE TABLE IF NOT EXISTS Birthdays (
  id            INTEGER NOT NULL UNIQUE,
  date          TEXT NOT NULL,
  userId        INTEGER NOT NULL,
  chatId        INTEGER NOT NULL,
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(userId, chatId) 
)