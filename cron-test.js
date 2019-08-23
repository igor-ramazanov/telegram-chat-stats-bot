let cron = require("cron")


let log = msg => console.log(new Date().toISOString() + " " + msg)


cron.job("*/10 * * * * *", () => {
    log("Every 10 seconds")
}).start()


cron.job("0 * * * * *", () => {
    log("Every begginning of a minute")
}).start()


cron.job("* 0 * * * *", () => {
    log("Every beginning of an hoir")
}).start()
