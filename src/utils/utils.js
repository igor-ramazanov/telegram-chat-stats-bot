const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const isProduction = () => process.env.NODE_ENV === "production";

const getTodayTimestamp = () => dayjs.utc().startOf("day").unix();

const getYesterdayTimestamp = () => dayjs.utc().startOf("day").subtract(1, "day").unix();

const loadAll = (rootPath) => {
  return fs
    .readdirSync(rootPath)
    .filter((file) => file.endsWith(".js"))
    .map((file) => {
      require(path.join(rootPath, file));
      return file;
    });
};

const loadAllRecursive = (rootPath, predicate) => {
  predicate ??= () => true;
  return fs
    .readdirSync(rootPath, { recursive: true })
    .filter(predicate)
    .map((file) => {
      require(path.join(rootPath, file));
      return file;
    });
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
  getTodayTimestamp,
  getYesterdayTimestamp,
  loadAll,
  loadAllRecursive,
  toDateString,
  fromDateString,
  SEC,
  MIN,
  HOURS,
  DAYS,
  WEEKS,
};
