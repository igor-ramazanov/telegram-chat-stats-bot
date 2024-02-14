const { config } = require("./config");
const OpenAI = require("openai");
const { delay, safe } = require("./utils/utils");

/** @type {OpenAI.OpenAI} */
let _api;
let _hasGpt = false;

if (process.env.GPT_KEY) {
  _api = new OpenAI({ apiKey: process.env.GPT_KEY });
  _hasGpt = true;
  console.log("initialized gpt");
}

const composeMessages = (question, system) => {
  const messages = [];
  if (!question) throw new Error("prompt can't be empty");
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: question });
  return messages;
};

const isGptAvailable = () => {
  return _hasGpt && config.gpt.enabled;
};

const ensureAvailable = () => {
  if (!isGptAvailable()) throw new Error('Gpt is not available');
}

const askGpt = async (
  question,
  { model = config.gpt.completionParams.model, system, completionParams, onError } = {}
) => {
  const messages = composeMessages(question, system);
  try {
    ensureAvailable();
    const comp = await _api.chat.completions.create({
      ...config.gpt.completionParams,
      ...completionParams,
      messages,
      model
    });

    return comp.choices[0].message.content;
  } catch (err) {
    console.error("gpt error", err);
    onError?.();
    return null;
  }
};

const askGptStream = async (
  question,
  onChunk,
  {
    model = config.gpt.completionParams.model,
    updateInterval = 0,
    completionParams,
    system,
    onError
  } = {}
) => {
  const messages = composeMessages(question, system);
  try {
    ensureAvailable();
    const stream = await _api.chat.completions.create({
      ...config.gpt.completionParams,
      ...completionParams,
      messages,
      model,
      stream: true
    });

    let ts = Date.now();
    let response = "";
    for await (let chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      response += delta;
      if (response.length > 0 && Date.now() - ts > updateInterval) {
        await onChunk(response);
        ts = Date.now();
      }
    }
    await delay(updateInterval - (Date.now() - ts));
    await onChunk(response);
    return response;
  } catch (err) {
    console.error("gpt stream error", err);
    onError?.();
    return null;
  }
};

const gpt = {
  isGptAvailable,
  askGpt,
  askGptStream
};

module.exports = gpt;
