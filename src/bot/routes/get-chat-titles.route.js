const { db } = require("../../db/db");
const { toTimestamp, getNow } = require("../../utils/utils");
const { bot } = require("../bot");

const statement = db.prepare(
  `SELECT * FROM ChatTitles WHERE chatId=?`
);

bot.command("titles", (ctx, next) => {
  const data = statement.all(ctx.chat.id);
  if (data.length === 0) return ctx.reply("Название чата не менялось");
  const msg = ['История названий чата:']
  msg.push(...data.map(_ => `${_.timestamp} ${_.title}`))
  ctx.reply(msg.join("\n"))
});
