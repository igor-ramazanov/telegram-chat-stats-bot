const path = require("path");
const fs = require("fs");
const { db } = require("../src/db/db");
const dayjs = require("dayjs");
const { config } = require("../src/config");
const { toTimestamp } = require("../src/utils/utils");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));



const FAKE_USER_ID = 0;

const knownIds = {
  vpvha: 6228055,
  serjeus: 133000754,
  prmkv: 1936898466,
  starina_biba: 247768455,
  varentsovt: 283147030,
  tweekypie: 37234648,
  vitalkaaa93: 292708186,
  KirillFaraday: 57822017,
  // 'Viktor_VVS': ,
  danselyakov: 171969486,
  LVaren: 283147030,
  // 'garage_druid': ,
  yanealadin: 145061553,
  goooooodboy: 173954255,
  Дмитрий: 282714653,
  kondr_ds: 282714653,
  Egorzaaa: 228470229,
  surfgg: 270761388,
  // 'Aodhfaion': ,
  grigory_ko: 270761388,
  // 'Igor X': ,
  // 'GroupAnonymousBot': ,
  // 'Disas13': ,
  // 'Steguser': ,
  // 'Nik_R_D': ,
  // 'steguser': ,
  // 'Колюня Фазлеев': ,
  // 'Tony Hlopkins': ,
  Alexander: 1936898466,
  // 'Nik_RuDy': ,
  "kondr.ds": 282714653
  // 'NikRD1123':
};

const isFile = path => {
  const stat = fs.lstatSync(path);
  return stat.isFile();
};

const isJson = path => path.endsWith(".json");

const parseDate = t => {
  const m = t.match(/([\d]+)-([\d]+)-([\d]+)/);
  if (!m) return null;
  return dayjs
    .utc()
    .tz(config.timezone)
    .set("day", parseInt(m[1]))
    .set("month", parseInt(m[2]) - 1)
    .set("year", parseInt(m[3]))
    .startOf("day");
};

const migrate = (rootPath = "stats") => {
  const files = fs
    .readdirSync(rootPath)
    .map(_ => path.join(rootPath, _))
    .filter(isFile)
    .filter(isJson);

  for (let file of files) {
    if (fs.existsSync(file + ".migrated")) continue;
    try {
      const date = parseDate(file);
      if (!date) continue;
      const content = JSON.parse(fs.readFileSync(file, "utf-8"));
      migrateFile(content, date);
      fs.writeFileSync(file + ".migrated", "");
    } catch (err) {
      console.error("error migrating file", file, err);
    }
  }
};

const insertOneMessageSt = db.prepare(
  `INSERT INTO Messages (timestamp, chatId, userId)
  VALUES (:timestamp, :chatId, :userId)`
);

const migrateFile = (data, date) => {
  const formattedDate = toTimestamp(date);
  for (let chatId of Object.keys(data)) {
    if (chatId > 0) continue; // skip direct messages
    let messages = Object.values(data[chatId]).reduce((a, b) => a + b);
    console.log("migrating chat",{chatId, formattedDate, messages});
    chatId = parseInt(chatId);
    for (let username of Object.keys(data[chatId])) {
      if (!knownIds[username]) continue;
      console.log("messages for user: ", username, data[chatId][username]);
      for (let i = 0; i < data[chatId][username]; i++) {
        insertOneMessageSt.run({
          timestamp: formattedDate,
          userId: knownIds[username],
          chatId
        });
      }
      messages -= data[chatId][username];
    }
    console.log("other messages", messages);
    for (let i = 0; i < messages; i++) {
      insertOneMessageSt.run({
        timestamp: formattedDate,
        userId: FAKE_USER_ID,
        chatId
      });
    }
  }
};

const rootPath = process.argv.at(-1);
migrate(rootPath);
