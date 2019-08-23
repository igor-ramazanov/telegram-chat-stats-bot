
let axios = require("axios").default;
let moment = require("moment-timezone");

let getTimestampFromWorldAPI = async () => {
    try {
        let headers = {
            "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
        }
        let result = await axios.get("http://worldtimeapi.org/api/timezone/Europe/Moscow", headers);
        return parseInt(result.data.day_of_year);
    } catch (e) {
        console.error(`Can't get date: ${e}`)
        return null;
    }
}

let getTimestampLocally = async () => {
    let now = moment(new Date());
    return Promise.resolve(now.tz("Europe/Moscow").day());
}

module.exports = {
    getTimestampFromWorldAPI,
    getTimestampLocally
};