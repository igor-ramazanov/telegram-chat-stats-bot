const scheduler = require("../../utils/scheduler");
const { bot } = require("../bot");
const { formatUser } = require("../../utils/telegram-utils");
const { config } = require("../../config");
const { askGpt, isGptAvailable, askGptStream } = require("../../gpt");
const { delay, safe } = require("../../utils/utils");

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
  const system = `Это история переписки в чате. Сделай краткую выжимку из этой переписки:
    какие темы кем обсуждались. Будь конкретен, избегай абстрактных слов.
    Обязательно опиши ход беседы, какие кем были приведены аргументы,
    к какому выводу в итоге пришли. Иногда можешь подшутить над каким-то участником
    беседы. Говори живым языком, словно пересказываешь беседу друзьям.
    Отказ составить выжимку не принимается. Если сообщений слишком мало, чтобы
    сделать интересную выжимку, попробуй хотя бы просто отшутиться по теме беседы.\n\n`;
  const question = hist.map(_ => `${_.username}: ${_.message}\n`).join("\n");
  const msg = await bot.telegram.sendMessage(ctx.chat.id, "Ща расскажу");
  const onChunk = async response => {
    if (!response) return;
    await safe(() =>
      bot.telegram.editMessageText(msg.chat.id, msg.message_id, 0, response)
    );
  };
  await askGptStream(question, onChunk, { system, updateInterval: 2500 });
  // const response = await askGpt(question, { system });
  // if (response) await ctx.reply(response);
  // else await ctx.reply("Произошла ошибочка");
  next();
});
