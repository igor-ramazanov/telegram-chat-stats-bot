const { db } = require("../../db/db");
const { getTodayTimestamp } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `INSERT INTO MessageCount (timestamp, chatId, userId, messageCount)
    VALUES (:timestamp, :chatId, :userId, 1)
    ON CONFLICT(timestamp, chatId, userId) DO UPDATE SET
    messageCount=messageCount+1
    WHERE timestamp=:timestamp AND chatId=:chatId AND userId=:userId;`,
);

const ignoreWhen = [
  "pinned_message",
  "new_chat_members",
  "new_chat_member",
  "left_chat_memeber",
];

bot.on("message", async (ctx, next) => {
  if (ctx.message.from.is_bot) return next();
  if (ignoreWhen.some((_) => _ in ctx.message)) return next();
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const timestamp = getTodayTimestamp();
  statement.run({ timestamp, chatId, userId });
  console.log("counted message", { chatId, userId, timestamp });
  next();
});
