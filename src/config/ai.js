const AppError = require('../utils/AppError');

require('dotenv').config();
const aiConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  provider: process.env.AI_PROVIDER || 'ollama', // 'ollama' | 'anthropic'
  model: process.env.AI_MODEL || 'llama3.2',
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
  maxOutputTokens: Number(process.env.AI_MAX_TOKENS || 500),
  canary: process.env.AI_CANARY,
};

if (aiConfig.enabled && aiConfig.provider === 'anthropic' && !aiConfig.apiKey) {
  throw new AppError('AI_PROVIDER=anthropic requires ANTHROPIC_API_KEY', 400);
}
module.exports = { aiConfig };
