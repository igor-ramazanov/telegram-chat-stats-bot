let getRand = (source, total) => {
    return source[Math.floor(source.length * Math.random())].replace("%", total)
}

module.exports = function getHeader(total, average) {
    


    let mainMessage = `За сегодня уважаемые участники этого чата написали ${total} сообщений`;
    
    let index = typeof average === 'number' && average > 0
        ? total / average
        : null;
    
    let indexMessage = index === null
        ? null
        : `Индекс базара составил ${Math.round(index * 100) / 100}`;
    
    let overall = [mainMessage, indexMessage]
        .filter(a => typeof a === 'string' && a.length > 0)
        .join("\n");
    
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