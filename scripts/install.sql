CREATE TABLE IF NOT EXISTS Messages (
  id            INTEGER NOT NULL UNIQUE,
  timestamp     DATETIME NOT NULL,
	chatId	      INTEGER NOT NULL,
  userId        INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT)
); 

CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON Messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_weekday ON Messages(CAST(strftime('%w', DATE(timestamp)) AS INTEGER));

CREATE TABLE IF NOT EXISTS Birthdays (
  id            INTEGER NOT NULL UNIQUE,
  date          TEXT NOT NULL,
  userId        INTEGER NOT NULL,
  chatId        INTEGER NOT NULL,
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(userId, chatId) 
);

CREATE INDEX IF NOT EXISTS idx_birthdays_chatId ON Birthdays(chatId);

CREATE TABLE IF NOT EXISTS ChatTitles (
  id            INTEGER NOT NULL UNIQUE,
  chatId        INTEGER NOT NULL,
  userId        INTEGER NOT NULL,
  timestamp     DATETIME NOT NULL,
  title         TEXT NOT NULL,
  PRIMARY KEY(id AUTOINCREMENT)
)