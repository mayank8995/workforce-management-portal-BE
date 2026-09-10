const { randomUUID } = require('node:crypto');
const { complete, AIUnavailableError } = require('../ai/client.js');
const {
  system_prompt,
} = require('../config/ai_system_prompt_about_project.js');
const { aiConfig } = require('../config/ai.js');
const logger = require('../logger/logger.js');
const summarize = async (req, res) => {
  const requestId = randomUUID();
  // console.log('reqDSFSDFSDFSD', req.body);

  try {
    const { text, history = [] } = req.body ?? {};
    // console.log('DSFSDFSDFSD', text, history);
    const trimmed = text?.trim();
    if (
      typeof trimmed !== 'string' ||
      trimmed.length < 2 ||
      trimmed.length > 200
    ) {
      throw new Error({ error: 'text must be 2-200 characters', status: 400 });
    }
    if (!Array.isArray(history))
      throw new Error({ success: false, message: 'bad history', status: 400 });

    const cleanHistory = history
      ?.filter(
        (m) =>
          (m?.role === 'user' || m?.role === 'assistant') &&
          typeof m?.content === 'string'
      )
      ?.slice(-6)
      ?.map((m) => ({
        role: m?.role,
        content:
          m?.role === 'user'
            ? `<user_message>\n${m?.content.slice(0, 200)}\n</user_message>`
            : m?.content.slice(0, 1200),
      }));
    const messages = [
      ...cleanHistory,
      { role: 'user', content: `<user_message>\n${trimmed}\n</user_message>` },
    ];
    // console.log('messages>>>', messages);
    const answer = await complete({
      requestId,
      system: system_prompt,
      user: messages,
    });
    if (
      answer.includes(aiConfig?.canary) ||
      answer.includes('# ROLE') ||
      answer.length > 1200
    ) {
      logger.info('ai.leak_blocked', { evt: 'ai.leak_blocked', requestId });
      return {
        summary: 'I can only answer questions about this project.',
        requestId,
      };
    }
    return { summary: answer, requestId };
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      throw new Error({ error: 'AI unavailable', status: 502 });
    }
    throw new Error({ error: 'summarization failed', requestId, status: 503 });
  }
};

module.exports = { summarize };
