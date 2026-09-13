const service = require('../services/analyticsService');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
// const fakeService = require('../services/fakeServiceForTestingFrequestDataSentUsingWebsocket');

const getMetricEmployees = asyncHandler(async (req, res) => {
  const { metric } = req.params;

  const allowedMetrics = [
    'topPerformers',
    'meetingKPIs',
    'promotedThisYear',
    'requiringReview',
  ];

  if (!allowedMetrics.includes(metric)) {
    throw new AppError('Invalid analytics metric', 400);
  }

  let result;

  if (metric === 'promotedThisYear') {
    result = await service.getPromotedEmployees(req.query);
  } else {
    result = await service.getEmployeeMetric(metric, req.query);
  }

  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const result = await service.getAnalytics(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

const getFilters = asyncHandler(async (req, res) => {
  const result = await service.fetchFilters(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

// const fakeDataService = async (req, res) => {
//   try {
//     await fakeService.fakeDataService(req, res);
//   } catch (err) {
//     res.status(400).json({ success: false, message: err?.message });
//   }
// };
module.exports = {
  getMetricEmployees,
  getAnalytics,
  getFilters,
  // fakeDataService,
};
