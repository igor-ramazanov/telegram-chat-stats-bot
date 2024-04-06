const { Telegraf } = require("telegraf");
const { chatsOnlyMiddleware } = require("./middlewares/chats-only");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(chatsOnlyMiddleware);

bot.catch((err, _) => {
  console.error("bot error", err);
});

/**
 * @callback TelegramPassthroughCallback
 * @param {import('telegraf').Context} ctx
 * @param {Function} next
 */

/** @param {TelegramPassthroughCallback} callback */
const passthrough = callback => {
  let continued = false;
  return async (ctx, next) => {
    const _next = () => {
      if (continued) return;
      continued = true;
      next();
    };
    await callback(ctx, _next);
    _next();
  };
};

passthrough(ctx => {});

// const data = await bot.telegram.getChat(ctx.message.from.id);

module.exports = { bot, passthrough };
