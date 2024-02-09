const { bot } = require("../../bot/bot");
const scheduler = require("../../utils/scheduler");
const { transformUserIdsToUserObjects } = require("../../utils/telegram-utils");
const { getYesterdayTimestamp } = require("../../utils/utils");
const dayjs = require("dayjs");
const { config } = require("../../config");
const { formatUser } = require("../../utils/telegram-utils");
const { getHeader, getReport } = require("./helpers");
const { getBirthdaysText } = require("./helpers");

const sendDailyReport = async (date) => {
  date ??= getYesterdayTimestamp();
  const result = getReport(date);
  const promises = result.map(sendSingleReport);
  await Promise.allSettled(promises);
  console.log(`sent ${promises.length} daily reports`);
};

const sendSingleReport = async ({ chatId, userMessages, totalMessages, messagesAvg }) => {
  if (totalMessages <= 0) return;
  try {
    userMessages = JSON.parse(userMessages);
    const header = getHeader(
      totalMessages,
      messagesAvg,
      dayjs.utc().tz(config.timezone).get("day") - 1,
    );
    const birthdays = await getBirthdaysText(
      chatId,
      userMessages.map((_) => _.userId),
    );
    const users = await transformUserIdsToUserObjects(userMessages);
    users.forEach((_) => (_.username = formatUser(_.user)));
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
