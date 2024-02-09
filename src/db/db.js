const driver = require("better-sqlite3");
const { readFileSync } = require("fs");
const { config } = require("../config");
const fs = require("fs");
const path = require("path");

fs.mkdirSync(path.dirname(config.db), { recursive: true });
const db = driver(config.db);
db.exec(readFileSync("./sql/install.sql", "utf-8"));

module.exports = { db }; 
