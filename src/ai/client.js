const { aiConfig } = require('../config/ai.js');
const logger = require('../logger/logger.js');
class AIUnavailableError extends Error {}

async function callOllama({ system, user }) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(aiConfig.timeoutMs),
    body: JSON.stringify({
      model: aiConfig.model,
      stream: false,
      messages: [{ role: 'system', content: system }, ...user],
    }),
  });
  if (!res.ok) throw new Error(`ollama responded ${res.status}`);
  const d = await res.json();
  return {
    text: d.message.content,
    in: d.prompt_eval_count,
    out: d.eval_count,
  };
}

async function callAnthropic({ system, messages }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': aiConfig.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(aiConfig.timeoutMs),
    body: JSON.stringify({
      model: aiConfig.model,
      max_tokens: aiConfig.maxOutputTokens,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`anthropic responded ${res.status}`);
  const d = await res.json();
  return {
    text: d.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n'),
    in: d.usage.input_tokens,
    out: d.usage.output_tokens,
  };
}
async function complete({ system, user, requestId }) {
  if (!aiConfig.enabled) throw new AIUnavailableError('AI is disabled');

  const started = Date.now();
  try {
    const r =
      aiConfig.provider === 'anthropic'
        ? await callAnthropic({ system, user })
        : await callOllama({ system, user });

    logger.info('llm.call', {
      evt: 'llm.call',
      requestId,
      provider: aiConfig.provider,
      model: aiConfig.model,
      ok: true,
      ms: Date.now() - started,
      in: r.in,
      out: r.out,
    });
    return r.text;
  } catch (err) {
    logger.info('llm.call', {
      evt: 'llm.call',
      requestId,
      provider: aiConfig.provider,
      model: aiConfig.model,
      ok: false,
      ms: Date.now() - started,
      type: err.name,
      status: err.status,
    });
    throw err;
  }
}

module.exports = { AIUnavailableError, complete };
