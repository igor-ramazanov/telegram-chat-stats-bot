const { db } = require("../../db/db");
const { sendDailyReport } = require("../../jobs/send-daily-report");
const { toDateString } = require("../../utils/utils");
const { bot } = require("../bot");

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
  `INSERT INTO Birthdays (userId, date) 
    VALUES (:userId, :date)
    ON CONFLICT(userId) DO UPDATE SET
    date=:date
    WHERE userId=:userId`,
);

bot.command("dr", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const match = ctx.message.text.match(rex);
  if (!match) {
    ctx.reply("Неправильный формат дршки");
    return;
  }
  const dateRaw = new Date(Date.UTC(0, monthsMap[match[2]], parseInt(match[1], 10)));
  const date = toDateString(dateRaw, true);
  statement.run({ userId, date });
  await ctx.reply(`День рождения сохранен: ${date}`);
  console.log("set birthday", { chatId, userId, date });
});

bot.command("test", async (ctx) => {
  sendDailyReport();
});
