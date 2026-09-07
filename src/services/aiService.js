const { randomUUID } = require('node:crypto');
const { complete, AIUnavailableError } = require('../ai/client.js');

const summarize = async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== 'string' || text.length < 10 || text.length > 4000) {
    throw new Error({ error: 'text must be 10–4000 characters', status: 400 });
  }
  const requestId = randomUUID();
  try {
    const summary = await complete({
      requestId,
      system:
        'Summarize the input in two sentences. Plain text, no preamble, no markdown.',
      user: text,
    });
    return { summary, requestId };
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      throw new Error({ error: 'AI unavailable', status: 502 });
    }
    throw new Error({ error: 'summarization failed', requestId, status: 503 });
  }
};

module.exports = { summarize };
