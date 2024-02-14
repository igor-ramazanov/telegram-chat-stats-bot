const { db } = require("../../db");
const {
  isBotMessage,
  isEmptyMessage,
  isCommandMessage,
  isRegularMessage
} = require("../../utils/telegram-utils");
const { getNow, toTimestamp } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `INSERT INTO Messages (timestamp, chatId, userId) 
    VALUES (:timestamp, :chatId, :userId)`
);

bot.on("message", async (ctx, next) => {
  if (!isRegularMessage(ctx.message)) return next();
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const timestamp = toTimestamp(getNow());
  statement.run({ timestamp, chatId, userId });
  console.log("counted message", { chatId, userId, timestamp });
  next();
});
