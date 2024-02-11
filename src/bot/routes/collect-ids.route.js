const { bot } = require("../bot")
const fs = require("fs")


let data = {};
try {
  const content = fs.readFileSync("ids.json");
  data = JSON.parse(content)
} catch (err) {}

bot.on("message", (ctx, next) => {
  if (ctx.chat.id !== -1001278382802) return next();
  data[ctx.message.from.id] = {
    username: ctx.message.from.username,
    fn: ctx.message.from.first_name,
    ln: ctx.message.from.last_name,
  };
  fs.writeFileSync("ids.json", JSON.stringify(data, null, 3));
  next();
})

