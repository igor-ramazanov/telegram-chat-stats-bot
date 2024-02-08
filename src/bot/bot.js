const { Telegraf } = require("telegraf");
const { chatsOnlyMiddleware } = require("./middlewares/chats-only");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(chatsOnlyMiddleware);

bot.catch((err, _) => {
  console.error("bot error", err);
});

// const data = await bot.telegram.getChat(ctx.message.from.id);

module.exports = { bot };
