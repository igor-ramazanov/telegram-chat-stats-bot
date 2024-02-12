const path = require("path");
const fs = require("fs");
const { db } = require("../src/db");
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
  garage_druid: 65982034,
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
  const res = dayjs
    .utc()
    .set("year", parseInt(m[3]))
    .set("month", parseInt(m[2]) - 1)
    .set("date", parseInt(m[1]))
    .set("hour", 12)
    .set('minute', 0)
  return res;
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


const insertMany = (chatId, userId, timestamp, n) => {
  let q = 'INSERT INTO Messages (timestamp, chatId, userId) VALUES ';
  let qq = `(${[`'` + timestamp + `'`, chatId, userId].join(", ")})`;
  let qqq = [];
  for(let i = 0; i < n;i++) {
    qqq.push(qq);
  }
  q += qqq.join(", ");
  console.log(q);
  db.exec(q);
}

const migrateFile = (data, date) => {
  const formattedDate = toTimestamp(date);
  for (let chatId of Object.keys(data)) {
    if (chatId > 0) continue; // skip direct messages
    let messages = Object.values(data[chatId]).reduce((a, b) => a + b);
    console.log("migrating chat", { chatId, formattedDate, messages });
    chatId = parseInt(chatId);
    for (let username of Object.keys(data[chatId])) {
      if (!knownIds[username]) continue;
      console.log("messages for user: ", username, data[chatId][username]);
      insertMany(chatId, knownIds[username], formattedDate, data[chatId][username])
      messages -= data[chatId][username];
    }
    console.log("other messages", messages);
    insertMany(chatId, FAKE_USER_ID, formattedDate, messages)
  }
};

const rootPath = process.argv.at(-1);
migrate(rootPath);
