let getRand = (source, total) => {
    return source[Math.floor(source.length * Math.random())].replace("%", total)
}

module.exports = function getHeader(total) {
    
    return `За сегодня уважаемые участники этого чата написали ${total} сообщений`;

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