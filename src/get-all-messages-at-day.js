
let moment = require("moment-timezone");
let fs = require("fs")
let path = require("path")

function getAllMessagesAtDay(day, baseFolder = "stats/") {
    const startDate = moment("20180101", "YYYYMMDD");    
    const endDate = moment();
    let currentDate = startDate;
    let messageCountsByDays = {};

    while (currentDate <= endDate) {
        currentDate.add(1, "day");
        if (currentDate.day() !== day) continue;
        let filename = currentDate.format("D-M-YYYY") + ".json"
        filename = path.join(baseFolder, filename);
        
        if (!fs.existsSync(filename)) continue;

        let contentRaw = fs.readFileSync(filename).toString();
        let content = null;
        
        try {
            content = JSON.parse(contentRaw);
        } catch (e) {
            console.log(`Cant parse file ${filename}`);
        }
        if (content === null) continue;

        let dayCountsByChat = Object.entries(content).reduce((acc, [chatId, messageObj]) => {
            let totalMessages = Object.values(messageObj).reduce((acc, cur) => acc + cur, 0);
            acc[chatId] = totalMessages;
            return acc;
        }, {});
        
        Object.entries(dayCountsByChat).forEach(([chatId, totalMessages]) => {
            if (!messageCountsByDays[chatId]) {
                messageCountsByDays[chatId] = [];
            }
            messageCountsByDays[chatId].push(totalMessages);
        });
    }

    return messageCountsByDays;

}

function getAllMessagesAtDayForChat(day, chatId, baseFolder = "stats/") {
    let chatIdParsed = parseInt(chatId);
    
    if (isNaN(chatIdParsed)) {
        console.warn(`Wrong chat id given: ${chatId}`)
        return null;
    }

    let totals = getAllMessagesAtDay(day, baseFolder);

    if (totals[chatIdParsed]) {
        return totals[chatIdParsed]
    } else {
        return null;
    }
}

module.exports = {
    getAllMessagesAtDay,
    getAllMessagesAtDayForChat
}