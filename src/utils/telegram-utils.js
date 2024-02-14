const { bot } = require("../bot/bot");
const { cache } = require("./cache");
const { DAYS } = require("./utils");

const userCache = cache({ maxValues: 5000 });

const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds

const getTelegramUser = async id => {
  try {
    const cached = userCache.get(id);
    if (cached) return cached;
    const chat = await bot.telegram.getChat(id);
    if (chat) userCache.set(id, chat, { ttl: TTL });
    return chat;
  } catch (err) {
    return null;
  }
};

const formatUser = user => {
  return user.username ? user.username : [user.first_name, user.last_name].join(" ");
};

const transformUserIdsToUserObjects = async (list, getter) => {
  getter ??= _ => _.userId;
  if (!Array.isArray(list)) throw new Error("Array expected here");
  let promises = [];
  if (list.every(_ => typeof _ === "number" || typeof _ === "string"))
    promises = list.map(getTelegramUser);
  else if (list.every(_ => typeof _ === "object"))
    promises = list.map(async obj => {
      const userId = getter(obj);
      obj.user = await getTelegramUser(userId);
      return obj;
    });

  if (!promises) throw new Error("Wrong input", list);

  return await Promise.all(promises);
};

const isServiceMessage = msg => {
  const props = [
    "pinned_message",
    "new_chat_members",
    "new_chat_member",
    "left_chat_memeber"
  ];
  return props.some(_ => {
    if (Array.isArray(msg[_])) return msg[_].length !== 0;
    return Boolean(msg[_]);
  });
};

const isCommandMessage = msg => {
  return !isEmptyMessage(msg) && msg.text.startsWith("/");
};

const isEmptyMessage = msg => {
  return typeof msg.text !== "string" || msg.text.length === 0;
};

const isBotMessage = msg => {
  return msg.from.is_bot;
};

const isRegularMessage = msg => {
  return (
    !isBotMessage(msg) &&
    !isEmptyMessage(msg) &&
    !isCommandMessage(msg) &&
    !isServiceMessage(msg)
  );
};

module.exports = {
  getTelegramUser,
  formatUser,
  transformUserIdsToUserObjects,
  isCommandMessage,
  isServiceMessage,
  isEmptyMessage,
  isBotMessage,
  isRegularMessage
};
