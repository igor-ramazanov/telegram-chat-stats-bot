const path = require("path");
const fs = require("fs");

const isProduction = () => process.env.NODE_ENV === "production";

const getToday = () => {
  const today = new Date();
  today.setUTCHours(12);
  today.setUTCMilliseconds(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  return today;
};

const getYesterday = () => {
  const y = getToday();
  y.setDate(y.getDate() - 1);
  return y;
};

const loadAll = (rootPath) => {
  const out = [];
  fs.readdirSync(rootPath).forEach((file) => {
    if (!file.endsWith(".js")) return;
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(path.join(rootPath, file));
    out.push(file);
  });
  return out;
};

const toDateString = (date, noYear = false) => {
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString();
  const d = date.getDate().toString().padStart(2, 0);
  return noYear ? `${d}/${m}` : `${d}/${m}/${y}`;
};

const fromDateString = (dateStr) => {
  throw new Error("implement later");
};

const SEC = 0.001;
const MIN = SEC / 60;
const HOURS = MIN / 60;
const DAYS = HOURS / 24;
const WEEKS = DAYS / 7;

module.exports = {
  isProduction,
  getToday,
  getYesterday,
  loadAll,
  toDateString,
  fromDateString,
  SEC,
  MIN,
  HOURS,
  DAYS,
  WEEKS,
};
