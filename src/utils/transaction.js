const mongoose = require('mongoose');

// Runs fn(session) in a MongoDB transaction and returns its result.
// withTransaction retries on transient errors, so fn must be safe to re-run.
const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = { runInTransaction };
