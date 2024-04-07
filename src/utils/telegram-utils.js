const { bot } = require("../bot/bot");
const { db } = require("../db");
const { cache } = require("./cache");
const { logger } = require("./logger");
const { DAYS } = require("./utils");

const userCache = cache({ maxValues: 5000 });
const getUserStatement = db.prepare(`SELECT * FROM Users WHERE id=?`);
const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds

const getTelegramUser = async id => {
  try {
    let chat = userCache.get(id);
    chat ??= getUserStatement.get(id);
    console.log("vot", chat);
    chat ??= await bot.telegram.getChat(id);
    if (chat) userCache.set(id, chat, { ttl: TTL });
    return chat;
  } catch (err) {
    logger.error({ id, err }, "can't get telegram user");
    return null;
  }
};

const formatUser = user => {
  if (!user) {
    logger.warn(user, "trying to format unknown user");
    return "Unknown user";
  }
  return user.username || user.userName
    ? user.username ?? user.userName
    : [user.first_name ?? user.firstName, user.last_name ?? user.lastName].join(" ");
};

const transformUserIdsToUserObjects = async (list, getter) => {
  getter ??= _ => _.userId;
  if (!Array.isArray(list)) throw new Error("array expected here");
  let promises = [];
  if (list.every(_ => typeof _ === "number" || typeof _ === "string"))
    promises = list.map(getTelegramUser);
  else if (list.every(_ => typeof _ === "object"))
    promises = list.map(async obj => {
      const userId = getter(obj);
      obj.user = await getTelegramUser(userId);
      return obj;
    });

  if (!promises) throw new Error("wrong input", list);

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
