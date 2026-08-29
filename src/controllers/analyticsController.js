const service = require('../services/analyticsService');
const fetchEmployeeAnalytics = async (req, res) => {
  try {
    const response = await service.fetchEmployeeAnalytics(req);
    res.status(200).json({
      success: true,
      message: 'fetched data',
      data: response,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const populateEmployeeAnalytics = async (req, res) => {
  try {
    const response = await service.populateEmployeeAnalytics(req);
    res.status(200).json({
      success: true,
      message: 'fetched data',
      data: response,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

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
      messaged: 'Fetched successfully !!',
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
      messaged: 'Fetched successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchEmployeeAnalytics,
  populateEmployeeAnalytics,
  getMetricEmployees,
  getAnalytics,
};
