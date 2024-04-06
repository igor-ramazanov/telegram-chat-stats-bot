const { bot } = require("./bot/bot");
const { loadAll, loadAllRecursive } = require("./utils/utils");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));
dayjs.extend(require("dayjs/plugin/duration"));
dayjs.extend(require("dayjs/plugin/isToday"));
dayjs.extend(require("dayjs/plugin/isYesterday"));
dayjs.extend(require("dayjs/plugin/isTomorrow"));
dayjs.extend(require("dayjs/plugin/weekday"));
const scheduler = require("./utils/scheduler");
const path = require("path");
const { config } = require("./config");
const { getTelegramUser } = require("./utils/telegram-utils");
const { logger } = require("./utils/logger");
require("dotenv").config();

const loadJobs = () => {
  const jobs = loadAllRecursive(`${__dirname}/jobs/`, _ => _.endsWith(".job.js"));
};

const loadTelegramRoutes = () => {
  const routes = loadAllRecursive(`${__dirname}/bot/routes/`, _ =>
    _.endsWith(".route.js")
  );
};

const startup = async () => {
  loadTelegramRoutes();
  loadJobs();
  bot.launch();
  scheduler.start();
  logger.info("ready");
};

if (require.main === module) startup();
