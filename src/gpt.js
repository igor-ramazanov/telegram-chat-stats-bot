const { config } = require("./config");

let _hasGpt = false;
let _api;
if (process.env.GPT_KEY) {
  (async () => {
    const { ChatGPTAPI } = await import("chatgpt");
    _api = new ChatGPTAPI({
      apiKey: process.env.GPT_KEY,
      completionParams: config.gpt.completionParams
    });
    _hasGpt = true;
    console.log('initialized gpt')
  })();
}

const isGptAvailable = () => {
  return _hasGpt && config.gpt.enabled;
};

const askGpt = async question => {
  if (!isGptAvailable()) throw new Error("ChatGPT is not available");
  return await _api.sendMessage(question);
};

const gpt = {
  isGptAvailable,
  askGpt
};

module.exports = gpt;
