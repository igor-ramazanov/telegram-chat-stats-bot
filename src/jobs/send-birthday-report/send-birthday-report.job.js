const dayjs = require("dayjs");
const pluralize = require("pluralize-ru");
const {
  formatUser,
  transformUserIdsToUserObjects
} = require("../../utils/telegram-utils");
const { config } = require("../../config");
const { db } = require("../../db");
const fs = require("fs");
const { getNow } = require("../../utils/utils");
const { bot } = require("../../bot/bot");
const { everyDay } = require("../../utils/scheduler");
const { send } = require("process");
const { logger } = require("../../utils/logger");

const getBdayStatement = db.prepare(`SELECT date, userId FROM Birthdays WHERE chatId=?`);
const getChatsStatement = db.prepare(`SELECT DISTINCT chatId FROM Birthdays`);

const getEmojis = (len = 3) => {
  const allowed = Array.from("🎉🎉🎉🥳🎁🎊🎈");
  let out = [];
  while (out.length < len) out.push(allowed[Math.floor(Math.random() * allowed.length)]);
  return Buffer.from(out.join(""), "utf-8").toString();
};

const getBirthdaysText = async chatId => {
  const message = [];
  const year = dayjs().get("year");
  let bds = getBdayStatement.all(chatId);
  bds = await transformUserIdsToUserObjects(bds);
  bds.forEach(_ => (_.date = dayjs(`${year}-${_.date} 12:00`, "YYYY-MM-DD HH:mm")));
  bds.forEach(_ => (_.username = formatUser(_.user)));
  const bdsToday = bds.filter(
    _ => _.date.date() === getNow().date() && _.date.month() === getNow().month()
  );
  if (bdsToday.length > 0) {
    message.push(getEmojis());
    message.push(
      bdsToday.length > 1
        ? "Сегодня дни рождения празднуют:\n" +
            bdsToday.map(_ => "@" + _.username).join("\n")
        : "Сегодня день рождения празднует @" + bdsToday[0].username
    );
  }
  const bdsSoon = bds.filter(
    _ =>
      _.date.diff(getNow(), "day") <= config.birthdayRemindDays &&
      _.date.isAfter(getNow()) &&
      !bdsToday.includes(_)
  );
  if (bdsSoon.length > 0) {
    message.push("\n🗓 Ближайшие дни рождения: ");
    message.push(...bdsSoon.map(_ => _.username + ": " + _.date.format("DD/MM")));
  }
  return message.length > 0 ? message.join("\n").trim() : "";
};

const sendBirthdayReport = async () => {
  const chats = getChatsStatement.all().map(_ => _.chatId);
  for (let chatId of chats) {
    try {
      const msg = await getBirthdaysText(chatId);
      if (!msg.length) continue;
      await bot.telegram.sendMessage(chatId, msg);
      logger.info({chatId, msg}, 'birthday report sent')
    } catch (err) {
      logger.error(err, 'error when sending birthday report');
    }
  }
};

everyDay(sendBirthdayReport);

bot.command("test", ctx => {
  sendBirthdayReport();
});
