const { db } = require("../../db");
const { bot, passthrough } = require("../bot");

bot.command(
  "ttss",
  passthrough(async ctx => {
    const all = db.prepare('SELECT * FROM Users').all();
    console.log(all)
    ctx.reply(JSON.stringify(all, null, 3));
  })
);
