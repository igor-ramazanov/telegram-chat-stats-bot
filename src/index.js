const { bot } = require("./bot/bot");
const { loadAll, loadAllRecursive } = require("./utils/utils");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));
const scheduler = require("./utils/scheduler");
const path = require("path");
const { config } = require("./config");
require("dotenv").config();

const loadJobs = () => {
  const jobs = loadAllRecursive(`${__dirname}/jobs/`, (_) => _.endsWith(".job.js"));
  console.log(`loaded routes:\n${jobs.map((_) => `* ${path.basename(_)}`).join("\n")}`);
};

const loadTelegramRoutes = () => {
  const routes = loadAllRecursive(`${__dirname}/bot/routes/`, (_) =>
    _.endsWith(".route.js"),
  );
  console.log(`loaded jobs:\n${routes.map((_) => `* ${path.basename(_)}`).join("\n")}`);
};

const startup = async () => {
  loadTelegramRoutes();
  loadJobs();
  bot.launch();
  scheduler.start();
  console.log("ready");
};

if (require.main === module) startup();
