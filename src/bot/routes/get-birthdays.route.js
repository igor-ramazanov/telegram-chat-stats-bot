const dayjs = require("dayjs");
const { db } = require("../../db/db");
const {
  transformUserIdsToUserObjects,
  formatUser,
} = require("../../utils/telegram-utils");
const { bot } = require("../bot");

const statement = db.prepare(`
  SELECT * FROM Birthdays WHERE chatId=?
`);

bot.command("drs", async (ctx) => {
  let list = await transformUserIdsToUserObjects(statement.all(ctx.chat.id));
  list.forEach((_) => (_.date = dayjs(_.date, "MM-DD")));
  list = list.sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1));
  list.forEach((_) => (_.date = _.date.format("DD MMMM")));
  const msg = [
    "Дни рождения: ",
    ...list.map((_) => `${formatUser(_.user)}: ${_.date}`),
  ].join("\n");
  await ctx.reply(msg);
});
