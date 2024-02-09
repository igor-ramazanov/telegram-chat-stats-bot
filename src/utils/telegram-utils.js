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

const formatUser = (user) => {
  return user.username ? user.username : [user.first_name, user.last_name].join(" ");
};

const transformUserIdsToUserObjects = async (list, getter) => {
  getter ??= (_) => _.userId;
  if (!Array.isArray(list)) throw new Error("Array expected here");
  let promises = [];
  if (list.every((_) => typeof _ === "number" || typeof _ === "string"))
    promises = list.map(getTelegramUser);
  else if (list.every((_) => typeof _ === "object"))
    promises = list.map(async (obj) => {
      const userId = getter(obj);
      obj.user = await getTelegramUser(userId);
      return obj;
    });

  if (!promises) throw new Error("Wrong input", list);

  return await Promise.all(promises);
};

module.exports = { getTelegramUser, formatUser, transformUserIdsToUserObjects };
