const pino = require("pino");
const { config } = require("../config");
const fs = require("fs");
const path = require("path");

fs.mkdirSync(path.dirname(config.logs.fullLogPath), { recursive: true });

const logger = pino(
  {
    base: undefined,
    formatters: {
      level: label => {
        return { level: label.toUpperCase() };
      }
    }
  },
  pino.destination(config.logs.fullLogPath)
);
module.exports = { logger };
