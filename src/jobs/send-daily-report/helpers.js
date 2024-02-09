const dayjs = require("dayjs");
const pluralize = require("pluralize-ru");
const { getTelegramUser, formatUser } = require("../../utils/telegram-utils");
const { config } = require("../../config");
const { db } = require("../../db/db");
const fs = require("fs");

const getReportStatement = db.prepare(fs.readFileSync(`${__dirname}/get-report.sql`, "utf-8"));
const getBdayStatement = db.prepare(fs.readFileSync(`${__dirname}/get-birthday.sql`, "utf-8"));

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
  let mainMessage = `За сегодня уважаемые участники этого чата написали ${total} ${messageWord}`;
  let index = typeof average === "number" && average > 0 ? total / average : null;
  let indexMessage =
    index === null ? null : `и наговорили на ${Math.round(index * 100)}% от ${days[day]}`;
  let overall = [mainMessage, indexMessage]
    .filter((a) => typeof a === "string" && a.length > 0)
    .join(" ");
  return overall;
};

// TODO get birthdays with one request
exports.getBirthdaysText = async (chatId, userIds) => {
  const date = dayjs.utc().tz(config.timezone).format("DD/MM");
  const bd = userIds.map((_) => getBdayStatement.get(date, _, chatId)).filter(Boolean);
  if (bd.length === 0) return "";
  const userPromises = bd.map(async ({ userId }) => getTelegramUser(userId));
  const users = await Promise.all(userPromises);
  return [
    "🎉🎉🎉",
    users.length > 1 ? "Сегодня дни рождения празднуют:" : "Сегодня день рождения празднует",
    ...users.map(formatUser).map((_) => "@" + _),
  ].join("\n");
};

exports.getReport = (timestamp) => {
  return getReportStatement.all({ timestamp });
};
