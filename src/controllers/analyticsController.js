const service = require('../services/analyticsService');

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
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Fetched successfully !!',
    });
  }
};

module.exports = {
  getMetricEmployees,
  getAnalytics,
  getFilters,
};
