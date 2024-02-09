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
  const list = await transformUserIdsToUserObjects(
    statement.all(ctx.chat.id),
    (_) => _.userId,
  );
  const msg = [
    "Дни рождения: ",
    ...list.map((_) => `${formatUser(_.user)}: ${_.date}`),
  ].join("\n");
  await ctx.reply(msg);
});
