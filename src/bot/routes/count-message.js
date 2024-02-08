const { db } = require("../../db/db");
const { getToday, toDateString } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `INSERT INTO MessageCount (date, isoDate, chatId, userId, messageCount)
    VALUES (:date, :isoDate, :chatId, :userId, 1)
    ON CONFLICT(date, chatId, userId) DO UPDATE SET
    messageCount=messageCount+1
    WHERE date=:date AND chatId=:chatId AND userId=:userId;`,
);

bot.on("message", async (ctx, next) => {
  if (ctx.message.from.is_bot) return next();
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const isoDate = getToday().toISOString();
  const date = toDateString(getToday());
  statement.run({ date, chatId, userId, isoDate });
  console.log("counted message", { chatId, userId, date, isoDate });
  next();
});
