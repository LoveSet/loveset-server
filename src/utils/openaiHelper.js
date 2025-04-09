const OpenAI = require("openai");
const { openAISecret } = require("../config/config");
const logger = require("../config/logger");

const openai = new OpenAI({
  apiKey: openAISecret,
});

const queryGPT = async ({
  model = "gpt-4o-mini", // "gpt-4o" // gpt-4o-mini
  messages,
  responseFormat = {},
  stream = false,
}) => {
  let query = {
    messages,
    model,
    max_tokens: 2000, // 3000 // 4096
    ...responseFormat,
    stream,
  };

  const response = await openai.chat.completions.create(query);
  logger.info("🔰QueryGPT Called...");

  if (stream) {
    return response;
  } else {
    return response.choices[0]?.message?.content?.trim();
  }
};

const webSearch = async ({
  model = "gpt-4o", // "gpt-4o" // gpt-4o-mini
  input,
}) => {
  let query = {
    model,
    tools: [{ type: "web_search_preview" }],
    input,
  };

  const response = await openai.responses.create(query);
  console.log(response);
  return response.output_text;
};

module.exports = {
  queryGPT,
  webSearch,
};
