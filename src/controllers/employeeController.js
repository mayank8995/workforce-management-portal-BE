const service = require('../services/employeeService');
const logger = require('../logger/logger');

const getEmployees = async (req, res) => {
  try {
    const result = await service.getEmployees(req.query);
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

const getEmployeeDetails = async (req, res) => {
  try {
    const result = await service.getEmployeeDetails(req.query);
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

const getEmployeeProfile = async (req, res) => {
  try {
    const result = await service.getEmployeeProfile(req.query);
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
const editEmployeeProfile = async (req, res) => {
  try {
    const result = await service.editEmployeeProfile(req);
    return res.status(201).json({
      success: result,
      message: 'Updated successfully !!',
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

const createEmployee = async (req, res) => {
  try {
    const result = await service.createEmployee(req);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Created successfully !!',
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
const editEmployee = async (req, res) => {
  try {
    const result = await service.editEmployee(req);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Edited successfully !!',
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

const deleteEmployee = async (req, res) => {
  try {
    const result = await service.deleteEmployee(req.query);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Deleted successfully !!',
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

module.exports = {
  getEmployees,
  getEmployeeProfile,
  getEmployeeDetails,
  createEmployee,
  editEmployee,
  editEmployeeProfile,
  deleteEmployee,
};
