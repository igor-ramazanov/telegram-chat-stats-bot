let pluralize = require("pluralize-ru");

let getRand = (source, total) => {
    return source[Math.floor(source.length * Math.random())].replace("%", total)
}

let days = [
    "воскресенья",
    "понедельника",
    "вторника",
    "среды",
    "четверга",
    "пятницы",
    "субботы"
];

module.exports = function getHeader(total, average, day) {
    
    let messageWord = pluralize(total, "сообщений", "сообщение", "сообщения", "сообщений" )

    let mainMessage = `За сегодня уважаемые участники этого чата написали ${total} ${messageWord}`;
    
    let index = typeof average === 'number' && average > 0
        ? total / average
        : null;
    
    let indexMessage = index === null
        ? null
        : `и наговорили на ${Math.round(index * 100)}% от среднего ${days[day]}`;
    
    let overall = [mainMessage, indexMessage]
        .filter(a => typeof a === 'string' && a.length > 0)
        .join(" ");
    
    return overall;


    if (total < 100) {
        return getRand(low, total);
    }

    if (total < 250) {
        return getRand(medium, total);
    }

    return getRand(high, total);
    
}


const low = [
    
]

const medium = [
   
]

const high = [
    
]