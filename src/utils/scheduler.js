const { config } = require("../config");
const dayjs = require("dayjs");

const callbacks = {
  second: [],
  minute: [],
  hour: [],
  day: [],
  month: [],
  year: [],
};

const getState = () => {
  const date = dayjs.utc().tz(config.timezone);
  return Object.keys(callbacks).reduce((acc, key) => {
    acc[key] = date.get(key);
    return acc;
  }, {});
};

let prevState = getState();

const triggerCallbacks = (key) => callbacks[key].forEach((_) => _());

const step = () => {
  let diff = false;
  const newState = getState();
  const keys = Object.keys(newState);
  for (const key of keys) {
    if (newState[key] === prevState[key]) continue;
    diff = true;
    triggerCallbacks(key);
  }
  if (diff) prevState = newState;
};

let idx;
const start = () => {
  idx = setInterval(step, 1000);
  console.log("scheduler started");
};

const stop = () => {
  clearInterval(idx);
  console.log("scheduler stopped");
};

const getCallbackCreator = (key) => (cb) => {
  callbacks[key].push(cb);
};

const scheduler = {
  everySecond: getCallbackCreator("second"),
  everyMinute: getCallbackCreator("minute"),
  everyHour: getCallbackCreator("hour"),
  everyDay: getCallbackCreator("day"),
  everyMonth: getCallbackCreator("month"),
  everyYear: getCallbackCreator("year"),
  start,
  stop,
};

module.exports = scheduler;
