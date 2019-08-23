
const fs = require("fs");
const mkdir = require("make-dir")

let loadStats = () => {
    try {
        const stats = fs.readFileSync("stats/current.json").toString();
        const parsed = JSON.parse(stats);
        return parsed;
    } catch (e) {
        return {};
    }

}

let saveStats = stats => {
    try {
        mkdir("stats/")
        fs.writeFileSync("stats/current.json", JSON.stringify(stats, null, 3));
    } catch (e) {
        console.log(`Unable to save stats: ${e}`)
    }
}

module.exports = { saveStats, loadStats }