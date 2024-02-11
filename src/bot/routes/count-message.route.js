const { db } = require("../../db/db");
const { getNow, toTimestamp } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `INSERT INTO Messages (timestamp, chatId, userId) 
    VALUES (:timestamp, :chatId, :userId)`
);

const ignoreWhen = [
  "pinned_message",
  "new_chat_members",
  "new_chat_member",
  "left_chat_memeber"
];

bot.on("message", async (ctx, next) => {
  if (ctx.message.from.is_bot) return next();
  if (ignoreWhen.some(_ => _ in ctx.message)) return next();
  const chatId = ctx.chat.id;
  const userId = ctx.message.from.id;
  const timestamp = toTimestamp(getNow());
  statement.run({ timestamp, chatId, userId });
  console.log("counted message", { chatId, userId, timestamp });
  next();
});
