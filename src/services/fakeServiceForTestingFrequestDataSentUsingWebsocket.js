const fakeDataService = async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial message
  res.write(
    `data: ${JSON.stringify({
      message: 'Connected to prediction stream',
    })}\n\n`
  );

  let count = 0;

  // Mock frequent ML updates
  const interval = setInterval(() => {
    const data = {
      id: ++count,
      prediction: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.random(),
      timestamp: Date.now(),
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 500);

  // Stop sending when client disconnects
  req.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
};

module.exports = { fakeDataService };
