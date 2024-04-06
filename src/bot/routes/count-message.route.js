const { db } = require("../../db");
const { logger } = require("../../utils/logger");
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
  logger.log({chatId, userId, timestamp}, 'counted message');
  next();
});
