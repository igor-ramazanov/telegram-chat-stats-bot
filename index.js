const Telegraf = require("telegraf");
const { saveStats, loadStats } = require("./persist-stats")
const { getTimestampLocally : getDay } = require("./get-timestamp")
const getHeader = require("./get-header");

let stats = {};


let countMessage = (chatId, userId) => {
    if (!stats[chatId]) {
        stats[chatId] = {};
    }

    let chatStats = stats[chatId];

    if (!chatStats[userId]) {
        chatStats[userId] = 0;
    }

    chatStats[userId]++;

    console.log(`Counted message from ${userId} in chat ${chatId}`);
}

let onMessage = ctx => {

    if (ctx.message.is_bot) {
        return;
    }

    if (ctx.message.left_chat_participant || ctx.message.left_chat_member) {
        return;
    }

    if (ctx.message.new_chat_member || ctx.message.new_chat_members || ctx.message.new_chat_participant) {
        return;
    }

    let { username, first_name, last_name } = ctx.message.from;
    let userId = "" + (!!username 
        ? username 
        : `${first_name || ""} ${last_name || ""}`);
    let chatId = "" + ctx.message.chat.id;
    
    countMessage(chatId, userId.trim())
}


// notifies users and resets stats object
let sendAll = bot => {

    Object.keys(stats).forEach(chatId => {
        let chatStats = stats[chatId];
        if (!chatStats || Object.keys(chatStats) === 0) {
            return;
        }

        let pairs = Object.entries(chatStats).sort((a, b) => a[1] < b[1] ? 1 : -1)
        let total = pairs.reduce((acc, cur) => acc + cur[1], 0)
        let text = pairs.map(([name, count]) => {
            return `${name}: ${count}`
        }).join("\n");

        let header = getHeader(total);

        bot.telegram.sendMessage(parseInt(chatId), header + "\n" + text);

    });

    let date = [
        new Date().getDate(),
        new Date().getMonth() + 1,
        new Date().getFullYear()
    ].join("-");

    saveStats(stats, `stats/${date}.json`);
    stats = {};
    saveStats(stats);

}

let start = async () => {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    const botInfo = await bot.telegram.getMe();    
    bot.options.username = botInfo.username;


    stats = loadStats();
    console.log(`Loaded stats:\n` + JSON.stringify(stats, null, 3));

    bot.on("message", onMessage)
    let lastTimeStamp = await getDay();

    // persist stats on filesystem
    setInterval(() => saveStats(stats), 1000 * 60 * 2); // every 2 minutes

    // check whether it's time to send out stats
    setInterval(async () => {
        let ts = await getDay();

        if (ts === null) {
            return;
        }

        if (lastTimeStamp === ts) {
            return;
        }

        sendAll(bot);
        lastTimeStamp = ts;
    }, 1000 * 15); // every 15 seconds 


    bot.startPolling();
    console.log("Started polling")
};

start();