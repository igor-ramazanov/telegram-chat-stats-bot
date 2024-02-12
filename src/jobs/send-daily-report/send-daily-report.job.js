const { bot } = require("../../bot/bot");
const scheduler = require("../../utils/scheduler");
const { transformUserIdsToUserObjects } = require("../../utils/telegram-utils");
const { getYesterdayTimestamp, getNow, toTimestamp } = require("../../utils/utils");
const dayjs = require("dayjs");
const { config } = require("../../config");
const { formatUser } = require("../../utils/telegram-utils");
const {
  getHeader,
  getTotalMessagesBetweenTimestamps,
  getAvgMessagesOnWeekday,
  getUserMessagesBetweenTimestamps
} = require("./helpers");

const sendDailyReport = async date => {
  date = date ?? getNow().subtract(1, "day"); // yesterday by default
  const ts0 = toTimestamp(date.startOf("day"));
  const ts1 = toTimestamp(date.endOf("day"));
  const weekDay = date.get("day");
  const totals = getTotalMessagesBetweenTimestamps(ts0, ts1);
  const avgs = getAvgMessagesOnWeekday(weekDay);
  const grouped = totals.map(obj => {
    const avg = avgs.find(_ => _.chatId === obj.chatId);
    obj.messagesAvg = avg?.messagesAvg || 0;
    obj.userMessages = getUserMessagesBetweenTimestamps(ts0, ts1, obj.chatId);
    return obj;
  });
  const promises = grouped.map(_ => sendSingleReport(date, _));
  await Promise.allSettled(promises);
};

const sendSingleReport = async (
  date,
  { chatId, userMessages, totalMessages, messagesAvg }
) => {
  if (totalMessages <= 0) return;
  try {
    const header = getHeader(totalMessages, messagesAvg, date.get("day"));
    const users = await transformUserIdsToUserObjects(userMessages);
    users.forEach(_ => (_.username = formatUser(_.user)));
    users.sort((a, b) => b.messageCount - a.messageCount);
    const list = users.map(o => `${o.username}: ${o.messageCount}`).join("\n");
    const message = [header, "", list].join("\n");
    await bot.telegram.sendMessage(chatId, message);
    console.log(`sent daily report`, { chatId, totalMessages });
  } catch (err) {
    console.error(
      "error when sending report",
      { chatId, totalMessages, messagesAvg },
      err
    );
  }
};



scheduler.everyDay(sendDailyReport);
