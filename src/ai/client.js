const { aiConfig } = require('../config/ai.js');
const logger = require('../logger/logger.js');
class AIUnavailableError extends Error {}

async function complete({ system, user, requestId }) {
  if (!aiConfig.enabled) throw new AIUnavailableError('LLM is disabled');

  const started = Date.now();
  try {
    //http://localhost:11434/v1
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(aiConfig.timeoutMs),
      body: JSON.stringify({
        model: aiConfig.model,
        stream: false,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!res.ok) throw new Error(`ollama responded ${res.status}`);
    const data = await res.json();
    const text = data.message.content;

    logger.info('llm.call', {
      evt: 'llm.call',
      requestId,
      model: aiConfig.model,
      ok: true,
      ms: Date.now() - started,
      in: data.prompt_eval_count,
      out: data.eval_count,
    });

    return text;
  } catch (err) {
    logger.info('llm.call', {
      evt: 'llm.call',
      requestId,
      model: aiConfig.model,
      ok: false,
      ms: Date.now() - started,
      type: err.name,
    });
    throw err;
  }
}

module.exports = { AIUnavailableError, complete };
