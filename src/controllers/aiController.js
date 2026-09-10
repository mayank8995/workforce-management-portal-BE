const service = require('../services/aiService');
const logger = require('../logger/logger');

const summarize = async (req, res) => {
  try {
    const result = await service.summarize(req, res);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Fetched successfully !!',
    });
  } catch (err) {
    res
      .status(err?.status || 400)
      .json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

module.exports = { summarize };
