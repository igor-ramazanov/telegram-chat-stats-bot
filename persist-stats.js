
const fs = require("fs");
const mkdir = require("make-dir")

let loadStats = () => {
    try {
        const stats = fs.readFileSync("stats/current.json").toString();
        const parsed = JSON.parse(stats);
        return parsed;
    } catch (e) {
        console.log("Can't load stats");
        return {};
    }

}

let saveStats = (stats, path) => {
    path = path || "stats/current.json";
    try {
        mkdir("stats/")
        fs.writeFileSync(path, JSON.stringify(stats, null, 3));
    } catch (e) {
        console.log(`Unable to save stats: ${e}`)
    }
}

module.exports = { saveStats, loadStats }