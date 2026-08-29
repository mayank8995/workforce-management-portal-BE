const service = require('../services/employeeService');

const getEmployees = async (req, res) => {
  try {
    const result = await service.getEmployees(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      messaged: 'Fetched successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getEmployeeDetails = async (req, res) => {
  try {
    const result = await service.getEmployeeDetails(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      messaged: 'Fetched successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    const result = await service.getEmployeeProfile(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      messaged: 'Fetched successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getEmployees, getEmployeeProfile, getEmployeeDetails };
