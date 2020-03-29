const Telegraf = require("telegraf");
const { saveStats, loadStats } = require("./persist-stats")
const { getTimestampLocally : getDay } = require("./get-timestamp")
const getHeader = require("./get-header");
const { getAverageMessagesAtDay } = require("./src/get-average-messages-at-day");
const moment = require("moment-timezone");

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

let userRepeats = {};
let onMessage = ctx => {
    if (parseInt(ctx.message.chat.id) > 0) {
        if (!userRepeats[ctx.message.chat.id]) {
            userRepeats[ctx.message.chat.id] = 0;
        }
        let repeats = {
            "4": "Хорош",
            "5": "Хорош, говорю",
            "6": "Сука, заебал!!1",
            "7": "Игнорю..."
        };

        userRepeats[ctx.message.chat.id] += 1;
        if (userRepeats[ctx.message.chat.id] <= 3) {
            return ctx.reply("Добавляй меня в свою конфу, и каждый день в 24:00 я буду присылать туда статистику сообщений за сегодняшний день.")
        } else {
            if (repeats[userRepeats[ctx.message.chat.id]]) {
                return ctx.reply(repeats[userRepeats[ctx.message.chat.id]]);
            }
            return;       
        }
    }

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
    let day = moment().subtract(2, "hour").day();
    let averages = getAverageMessagesAtDay(day);

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

        

        let header = getHeader(total, averages[chatId], day);

        bot.telegram.sendMessage(parseInt(chatId), header + "\n" + text);

    });

    stats = {};
    saveStats(stats);

}

let start = async () => {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    const botInfo = await bot.telegram.getMe();    
    bot.options.username = botInfo.username;


    stats = loadStats();
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


    bot.startPolling()
};

start();