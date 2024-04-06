const { db } = require("../../db");
const { bot, passthrough } = require("../bot");

const statement = db.prepare(
  `INSERT INTO Users (id, firstName, lastName, userName) 
    VALUES (:id, :firstName, :lastName, :userName)
    ON CONFLICT (id) DO UPDATE 
    SET firstName = EXCLUDED.firstName, 
        lastName = EXCLUDED.lastName, 
        userName = EXCLUDED.userName;`
);

bot.on(
  "message",
  passthrough(async ctx => {
    if (!ctx.message.from?.id) return;
    const data = {
      id: ctx.message.from.id,
      firstName: ctx.message.from.first_name ?? "",
      lastName: ctx.message.from.last_name ?? "",
      userName: ctx.message.from.username ?? ""
    };
    statement.run(data);
  })
);
