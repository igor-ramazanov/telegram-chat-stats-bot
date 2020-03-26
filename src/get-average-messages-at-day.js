let { getAllMessagesAtDay, getAllMessagesAtDayForChat } = require("./get-all-messages-at-day");

function getAverageMessagesAtDay(day, baseFolder) {
    let allMessagesByChatId = getAllMessagesAtDay(day, baseFolder);
    let averages = Object.entries(allMessagesByChatId).reduce((acc, [chatId, array]) => {
        if (!array || array.length === 0) {
            acc[chatId] = null;
            return acc;
        }
        let average = array.reduce((acc, cur) => acc + cur, 0) / array.length;
        acc[chatId] = average;
        return acc;
    });
    
    return averages
}


function getAverageMessagesAtDayForChat(day, chatId, baseFolder) {
    let chatIdParsed = parseInt(chatId);
    
    if (isNaN(chatIdParsed)) {
        console.warn(`Wrong chat id given: ${chatId}`)
        return null;
    }

    let averages = getAllMessagesAtDay(day, baseFolder);

    if (averages[chatIdParsed]) {
        return averages[chatId]
    } else {
        return null;
    }
}

module.exports = {
    getAverageMessagesAtDay,
    getAverageMessagesAtDayForChat
}