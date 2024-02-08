const { bot } = require("./bot/bot");
const scheduler = require("./utils/scheduler");
const { loadAll } = require("./utils/utils");
require("dotenv").config();

const loadJobs = () => {
  const jobs = loadAll(`${__dirname}/jobs/`);
  console.log(`loaded jobs: ${jobs.join(", ")}`);
};

const loadTelegramRoutes = () => {
  const routes = loadAll(`${__dirname}/bot/routes`);
  console.log(`loaded bot routes: ${routes.join(", ")}`);
};

const startup = async () => {
  loadTelegramRoutes();
  loadJobs();
  bot.launch();
  scheduler.start();
  console.log("ready");
};

if (require.main === module) startup();
