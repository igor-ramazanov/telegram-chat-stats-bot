const message =
  "Добавь меня в свой чатик и я буду каждый день присылать тебе статистику вашего пиздежа :)";

exports.chatsOnlyMiddleware = (ctx, next) => {
  if (ctx.chat.id > 0) {
    ctx.reply(message);
    return;
  }
  next();
};
