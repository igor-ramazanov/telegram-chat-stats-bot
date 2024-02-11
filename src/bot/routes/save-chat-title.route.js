const { db } = require("../../db/db");
const { toTimestamp, getNow } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `INSERT INTO ChatTitles (chatId, userId, timestamp, title) 
    VALUES (:chatId, :userId, :timestamp, :title)`
);

bot.on("message", (ctx, next) => {
  if (ctx.message.new_chat_title) {
    statement.run({
      chatId: ctx.chat.id,
      userId: ctx.message.from.id,
      timestamp: toTimestamp(getNow()),
      title: ctx.message.new_chat_title
    });
  }
  next();
});
