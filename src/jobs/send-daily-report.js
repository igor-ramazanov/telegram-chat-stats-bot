const { bot } = require("../bot/bot");
const { db } = require("../db/db");
const scheduler = require("../utils/scheduler");
const { getTelegramUser } = require("../utils/telegram-utils");
const { getToday, toDateString, getYesterday } = require("../utils/utils");
const pluralize = require("pluralize-ru");

const formatUser = (user) => {
  return user.username ? user.username : [user.first_name, user.last_name].join(" ");
};

let days = [
  "среднего воскресенья",
  "среднего понедельника",
  "среднего вторника",
  "средней среды",
  "среднего четверга",
  "средней пятницы",
  "средней субботы",
];

const getHeader = (total, average, day) => {
  let messageWord = pluralize(total, "сообщений", "сообщение", "сообщения", "сообщений");
  let mainMessage = `За сегодня уважаемые участники этого чата написали ${total} ${messageWord}`;
  let index = typeof average === "number" && average > 0 ? total / average : null;
  let indexMessage =
    index === null ? null : `и наговорили на ${Math.round(index * 100)}% от ${days[day]}`;
  let overall = [mainMessage, indexMessage]
    .filter((a) => typeof a === "string" && a.length > 0)
    .join(" ");
  return overall;
};

const birthdayStatement = db.prepare(`
  SELECT * FROM Birthdays WHERE date=? AND userId=?
`);

const getBirthdaysText = async (userIds) => {
  const date = toDateString(getToday(), true);
  const bd = userIds.map((_) => birthdayStatement.get(date, _)).filter(Boolean);
  if (bd.length === 0) return "";
  const userPromises = bd.map(async ({ userId }) => getTelegramUser(userId));
  const users = await Promise.all(userPromises);
  return [
    "🎉🎉🎉",
    users.length > 1 ? "Сегодня дни рождения празднуют:" : "Сегодня день рождения празднует",
    ...users.map(formatUser).map((_) => "@" + _),
  ].join("\n");
};

const statement = db.prepare(`
  WITH mc AS (
    SELECT 
      chatId, 
      userId, 
      SUM(messageCount) AS messageCount
    FROM 
        MessageCount 
    WHERE
      date=:date
    GROUP BY 
        chatId, userId
  ), am AS (
    SELECT
      chatId,
      AVG(messageCount) AS messagesAvg
    FROM
      MessageCount
    GROUP BY
      chatId
  )

  SELECT 
      mc.chatId,
      am.messagesAvg,
      SUM(mc.messageCount) AS totalMessages,
      JSON_GROUP_ARRAY(
          JSON_OBJECT('userId', mc.userId, 'messageCount', mc.messageCount)
      ) AS userMessages
  FROM mc
  JOIN am ON am.chatId=mc.chatId
  GROUP BY 
      mc.chatId;
`);

const sendDailyReport = async () => {
  const yesterday = getToday();
  const result = statement.all({ date: toDateString(yesterday) });
  const promises = result.map(sendSingleReport);
  await Promise.allSettled(promises);
  console.log(`sent ${promises.length} daily reports`);
};

const sendSingleReport = async ({ chatId, userMessages, totalMessages, messagesAvg }) => {
  if (totalMessages <= 0) return;
  try {
    userMessages = JSON.parse(userMessages);
    const header = getHeader(totalMessages, messagesAvg, getYesterday().getUTCDay());
    const birthdays = await getBirthdaysText(userMessages.map((_) => _.userId));
    const userPromises = userMessages.map(async ({ userId, messageCount }) => {
      const user = await getTelegramUser(userId);
      const username = formatUser(user);
      return { username, messageCount };
    });
    const users = await Promise.all(userPromises);
    const list = users.map((o) => `${o.username}: ${o.messageCount}`).join("\n");
    const message = [header, "", list, "", birthdays].join("\n");
    await bot.telegram.sendMessage(chatId, message);
    console.log(`sent daily report`, { chatId, userMessages, totalMessages });
  } catch (err) {
    console.error(
      "error when sending report",
      { chatId, userMessages, totalMessages, messagesAvg },
      err,
    );
  }
};

scheduler.everyDay(sendDailyReport);

module.exports = { sendDailyReport };
