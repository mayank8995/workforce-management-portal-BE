require('dotenv').config();
const aiConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  model: process.env.model || 'llama3.2:1b',
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 20000),
  maxOutputTokens: Number(process.env.AI_MAX_TOKENS || 500),
};

module.exports = { aiConfig };
