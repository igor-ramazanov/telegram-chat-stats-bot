const { db } = require("../../db");
const { toTimestamp, getNow } = require("../../utils/utils");
const { bot } = require("../bot");

const saveStatement = db.prepare(
  `INSERT INTO ChatTitles (chatId, userId, timestamp, title) 
    VALUES (:chatId, :userId, :timestamp, :title)`
);

bot.on("message", (ctx, next) => {
  if (ctx.message.new_chat_title) {
    saveStatement.run({
      chatId: ctx.chat.id,
      userId: ctx.message.from.id,
      timestamp: toTimestamp(getNow()),
      title: ctx.message.new_chat_title
    });
  }
  next();
});


const getStatement = db.prepare(
  `SELECT * FROM ChatTitles WHERE chatId=?`
);

bot.command("titles", (ctx, next) => {
  const data = getStatement.all(ctx.chat.id);
  if (data.length === 0) {
    ctx.reply("Название чата не менялось");
    return next();
  }
  const msg = ['История названий чата:']
  msg.push(...data.map(_ => `${_.timestamp} ${_.title}`))
  ctx.reply(msg.join("\n"))
});
