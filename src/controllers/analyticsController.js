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

module.exports = { fetchEmployeeAnalytics, populateEmployeeAnalytics };
