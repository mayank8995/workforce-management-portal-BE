const { aiConfig } = require('../config/ai.js');
const logger = require('../logger/logger.js');
const AppError = require('../utils/AppError.js');
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
  if (!res.ok) throw new AppError(`ollama responded ${res.status}`, res.statu);
  const d = await res.json();
  return {
    text: d.message.content,
    in: d.prompt_eval_count,
    out: d.eval_count,
  };
}

// async function callAnthropic({ system, messages }) {
//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': aiConfig.apiKey,
//       'anthropic-version': '2023-06-01',
//     },
//     signal: AbortSignal.timeout(aiConfig.timeoutMs),
//     body: JSON.stringify({
//       model: aiConfig.model,
//       max_tokens: aiConfig.maxOutputTokens,
//       system,
//       messages,
//     }),
//   });
//   if (!res.ok)
//     throw new AppError(`anthropic responded ${res.status}`, res.status);
//   const d = await res.json();
//   return {
//     text: d.content
//       .filter((b) => b.type === 'text')
//       .map((b) => b.text)
//       .join('\n'),
//     in: d.usage.input_tokens,
//     out: d.usage.output_tokens,
//   };
// }
async function callOpenAI({ system, user }) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    signal: AbortSignal.timeout(aiConfig.timeoutMs),
    body: JSON.stringify({
      model: aiConfig.model,
      instructions: system,
      input: user,
      max_output_tokens: aiConfig.maxOutputTokens,
    }),
  });
  const body = await res.text();

  if (!res.ok) {
    console.error('OpenAI ERROR:', {
      status: res.status,
      body,
    });

    throw new AppError(`OpenAI responded ${res.status}: ${body}`, res.status);
  }
  const d = JSON.parse(body);
  const text = (d.output ?? [])
    .filter((o) => o.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text)
    .join('\n');

  return {
    text,
    in: d?.usage?.input_tokens ?? 0,
    out: d?.usage?.output_tokens ?? 0,
    cached: d?.usage?.input_tokens_details?.cached_tokens ?? 0,
  };
}
async function complete({ system, user, requestId }) {
  if (!aiConfig.enabled) throw new AIUnavailableError('AI is disabled');

  const started = Date.now();
  try {
    const r =
      aiConfig.provider === 'openAI'
        ? await callOpenAI({ system, user })
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
