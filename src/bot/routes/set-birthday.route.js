const { config } = require("../../config");
const { db } = require("../../db/db");
const { sendDailyReport } = require("../../jobs/send-daily-report/send-daily-report.job");
const { toDateString, getYesterdayTimestamp, getTodayTimestamp } = require("../../utils/utils");
const { bot } = require("../bot");
const dayjs = require("dayjs");

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
  декабря: 11,
};

const months = Object.keys(monthsMap);
const rex = new RegExp(`([\\d]+)\\s+(${months.join("|")})`, "i");

const statement = db.prepare(
  `INSERT INTO Birthdays (chatId, userId, date) 
    VALUES (:chatId, :userId, :date)
    ON CONFLICT(userId, chatId) DO UPDATE SET
    date=:date
    WHERE userId=:userId AND chatId=:chatId
`);

bot.command("dr", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const match = ctx.message.text.match(rex);
  if (!match) {
    ctx.reply("Неправильный формат дршки");
    return;
  }
  const month = monthsMap[match[2]];
  const day = parseInt(match[1]);
  const date = dayjs.utc().tz(config.timezone).set("month", month).set("date", day).format("DD/MM");
  statement.run({ chatId, userId, date });
  await ctx.reply(`День рождения сохранен: ${date}`);
  console.log("set birthday", { chatId, userId, date });
});

bot.command("test", async (ctx) => {
  sendDailyReport(getTodayTimestamp());
});
