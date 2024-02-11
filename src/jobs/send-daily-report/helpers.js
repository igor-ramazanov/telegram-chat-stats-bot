const dayjs = require("dayjs");
const pluralize = require("pluralize-ru");
const {
  getTelegramUser,
  formatUser,
  transformUserIdsToUserObjects,
} = require("../../utils/telegram-utils");
const { config } = require("../../config");
const { db } = require("../../db");
const fs = require("fs");
const { getNow } = require("../../utils/utils");

const getTotalMessagesStatement = db.prepare(
  fs.readFileSync(`${__dirname}/get-total-messages.sql`, "utf-8"),
);
const getAvgMessagesStatement = db.prepare(
  fs.readFileSync(`${__dirname}/get-avg-messages.sql`, "utf-8"),
);
const getUserMessagesStatement = db.prepare(
  fs.readFileSync(`${__dirname}/get-user-messages.sql`, "utf-8"),
);

const days = [
  "среднего воскресенья",
  "среднего понедельника",
  "среднего вторника",
  "средней среды",
  "среднего четверга",
  "средней пятницы",
  "средней субботы",
];

exports.getHeader = (total, average, day) => {
  let messageWord = pluralize(total, "сообщений", "сообщение", "сообщения", "сообщений");
  let mainMessage = `За прошедший день уважаемые участники этого чата написали ${total} ${messageWord}`;
  let index = typeof average === "number" && average > 0 ? total / average : null;
  let indexMessage =
    index === null ? null : `и наговорили на ${Math.round(index * 100)}% от ${days[day]}`;
  let overall = [mainMessage, indexMessage].filter(Boolean).join(" ");
  return overall;
};

exports.getTotalMessagesBetweenTimestamps = (ts0, ts1) => {
  return getTotalMessagesStatement.all({ ts0, ts1 });
};

exports.getAvgMessagesOnWeekday = (weekDay) => {
  return getAvgMessagesStatement.all({ weekDay });
};

exports.getUserMessagesBetweenTimestamps = (ts0, ts1, chatId) => {
  return getUserMessagesStatement.all({ ts0, ts1, chatId });
};
