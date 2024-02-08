const path = require("path");
const fs = require("fs");
const { db } = require("../src/db/db");
const { toDateString } = require("../src/utils/utils");

const FAKE_USER_ID = 0;

const isFile = (path) => {
  const stat = fs.lstatSync(path);
  return stat.isFile();
};

const isJson = (path) => path.endsWith(".json");

const parseDate = (t) => {
  const m = t.match(/([\d]+)-([\d]+)-([\d]+)/);
  return new Date(Date.UTC(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])));
};

const statement = db.prepare(`
  INSERT INTO MessageCount (date, isoDate, chatId, userId, messageCount)
  VALUES (:date, :isoDate, :chatId, :userId, :messages)
  ON CONFLICT DO NOTHING
`);

const migrate = (rootPath = "stats") => {
  const files = fs
    .readdirSync(rootPath)
    .map((_) => path.join(rootPath, _))
    .filter(isFile)
    .filter(isJson);

  for (let file of files) {
    if (fs.existsSync(file + ".migrated")) continue;
    try {
      const date = parseDate(file);
      if (!date) continue;

      const content = JSON.parse(fs.readFileSync(file, "utf-8"));
      for (let chatId of Object.keys(content)) {
        const messages = Object.values(content[chatId]).reduce((a, b) => a + b);
        chatId = parseInt(chatId);
        statement.run({
          chatId,
          userId: FAKE_USER_ID,
          date: toDateString(date),
          isoDate: date.toISOString(),
          messages,
        });
        console.log("migrated file", { file, date, messages });
      }
      fs.writeFileSync(file + ".migrated", "");
    } catch (err) {
      console.error("error migrating file", file, err);
    }
  }
};

const rootPath = process.argv.at(-1);
migrate(rootPath);
