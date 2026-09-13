const service = require('../services/aiService');
const { asyncHandler } = require('../utils/asyncHandler');

const summarize = asyncHandler(async (req, res) => {
  const result = await service.summarize(req, res);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

module.exports = { summarize };
