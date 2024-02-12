const scheduler = require("../../utils/scheduler");
const { bot } = require("../bot");
const { formatUser } = require("../../utils/telegram-utils");
const { config } = require("../../config");
const { askGpt, isGptAvailable } = require("../../gpt");

const history = {};

const ignoreWhen = [
  "pinned_message",
  "new_chat_members",
  "new_chat_member",
  "left_chat_memeber"
];

bot.on("message", async (ctx, next) => {
  if (!config.gpt.allowedChats.includes(ctx.chat.id)) return next();
  if (ctx.message.from.is_bot) return next();
  if (!ctx.message.text) return next();
  if (ctx.message.text?.startsWith("/")) return next();
  if (ignoreWhen.some(_ => _ in ctx.message)) return next();
  const chatId = ctx.chat.id;
  const username = formatUser(ctx.message.from);
  history[chatId] ??= [];
  history[chatId].push({
    username,
    message: ctx.message.text
  });
  while (history[chatId].length > config.gpt.historyLength) {
    history[chatId].shift();
  }
  next();
});

bot.command("describe", async (ctx, next) => {
  if (!isGptAvailable()) return next();
  if (!config.gpt.allowedChats.includes(ctx.chat.id)) return next();
  const hist = history[ctx.chat.id];
  if (!hist || hist.length === 0) return await ctx.reply("Нет истории");
  const h =
    `Это история переписки в чате. Сделай краткую выжимку из этой переписки:
    какие темы кем обсуждались. Будь конкретен, избегай абстрактных слов.
    Обязательно опиши ход беседы, какие кем были приведены аргументы,
    к какому выводу в итоге пришли. Конкретно!\n\n`;
  const question = h + hist.map(_ => `${_.username}: ${_.message}\n`).join("\n");
  const response = await askGpt(question);
  if (!response.text) return;
  await ctx.reply(response.text);
  next();
});
