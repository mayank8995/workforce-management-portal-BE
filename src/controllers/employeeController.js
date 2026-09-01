const service = require('../services/employeeService');

const getEmployees = async (req, res) => {
  try {
    const result = await service.getEmployees(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Fetched successfully !!',
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
      message: 'Fetched successfully !!',
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
      message: 'Fetched successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const editEmployeeProfile = async (req, res) => {
  try {
    const result = await service.editEmployeeProfile(req);
    return res.status(201).json({
      success: result,
      message: 'Updated successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const result = await service.createEmployee(req);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Created successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const editEmployee = async (req, res) => {
  try {
    const result = await service.editEmployee(req);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Edited successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const result = await service.deleteEmployee(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Deleted successfully !!',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeProfile,
  getEmployeeDetails,
  createEmployee,
  editEmployee,
  editEmployeeProfile,
  deleteEmployee,
};
