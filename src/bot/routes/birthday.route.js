const { config } = require("../../config");
const { db } = require("../../db");
const { bot } = require("../bot");
const dayjs = require("dayjs");
const {
  transformUserIdsToUserObjects,
  formatUser
} = require("../../utils/telegram-utils");

const monthsMap = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11
};

const months = Object.keys(monthsMap);
const rex = new RegExp(`([\\d]+)\\s+(${months.join("|")})`, "i");

const saveStatement = db.prepare(
  `INSERT INTO Birthdays (chatId, userId, date) 
    VALUES (:chatId, :userId, :date)
    ON CONFLICT(userId, chatId) DO UPDATE SET
    date=:date
    WHERE userId=:userId AND chatId=:chatId`
);

const INVALID_FORMAT_MSG = "Неправильный формат дршки";

bot.command("dr", async (ctx, next) => {
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const match = ctx.message.text.match(rex);
  if (!match) {
     await ctx.reply(INVALID_FORMAT_MSG);
     return next();
  }
  const month = monthsMap[match[2]] + 1;
  const day = parseInt(match[1]);
  const date = dayjs(`${month}-${day} 12:00`, "M-D HH:mm").tz(config.timezone);
  const dbDate = date.format("MM-DD");
  if (!date.isValid()) return await ctx.reply(INVALID_FORMAT_MSG);
  saveStatement.run({ chatId, userId, date: dbDate });
  await ctx.reply(`День рождения сохранен: ${date.format("DD MMMM")}`);
  console.log("set birthday", { chatId, userId, date: dbDate });
  next();
});

const getStatement = db.prepare(`
  SELECT * FROM Birthdays WHERE chatId=?
`);

bot.command("drs", async (ctx, next) => {
  let list = await transformUserIdsToUserObjects(getStatement.all(ctx.chat.id));
  if (list.length === 0) {
    await ctx.reply("Нет сохраненных дней рождения");
    return next()
  }
  list.forEach(_ => (_.date = dayjs(_.date, "MM-DD")));
  list = list.sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1));
  list.forEach(_ => (_.date = _.date.format("DD MMMM")));
  const msg = [
    "Дни рождения: ",
    ...list.map(_ => `${formatUser(_.user)}: ${_.date}`)
  ].join("\n");
  await ctx.reply(msg);
  next();
});
