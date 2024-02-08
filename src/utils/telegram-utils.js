const { bot } = require("../bot/bot");
const { cache } = require("./cache");
const { DAYS } = require("./utils");

const userCache = cache({ maxValues: 5000 });

const getTelegramUser = async (id) => {
  try {
    const cached = userCache.get(id);
    if (cached) return cached;
    const chat = await bot.telegram.getChat(id);
    userCache.set(id, chat, { ttl: 7 * DAYS });
    return chat;
  } catch (err) {
    return null;
  }
};

module.exports = { getTelegramUser };
