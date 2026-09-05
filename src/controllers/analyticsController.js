const service = require('../services/analyticsService');
const logger = require('../logger/logger');
// const fakeService = require('../services/fakeServiceForTestingFrequestDataSentUsingWebsocket');

const getMetricEmployees = async (req, res) => {
  try {
    const { metric } = req.params;

    const allowedMetrics = [
      'topPerformers',
      'meetingKPIs',
      'promotedThisYear',
      'requiringReview',
    ];

    if (!allowedMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analytics metric',
      });
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
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const result = await service.getAnalytics(req);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Fetched successfully !!',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

const getFilters = async (req, res) => {
  try {
    const result = await service.fetchFilters(req);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Fetched successfully !!',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
    logger.error({
      message: err?.message,
      method: req?.method,
      url: req?.originalUrl,
      stack: err?.stack,
    });
  }
};

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
