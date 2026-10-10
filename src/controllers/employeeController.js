const service = require('../services/employeeService');
const promotionService = require('../services/promotionService');
const { asyncHandler } = require('../utils/asyncHandler');

const getEmployees = asyncHandler(async (req, res) => {
  const result = await service.getEmployees(req.query);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

const getEmployeeDetails = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeDetails(req.query);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

const getEmployeeProfile = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeProfile(req.query);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});
const editEmployeeProfile = asyncHandler(async (req, res) => {
  const result = await service.editEmployeeProfile(req);
  return res.status(201).json({
    success: result,
    message: 'Updated successfully !!',
  });
});

const createEmployee = asyncHandler(async (req, res) => {
  const result = await service.createEmployee(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Created successfully !!',
  });
});
const editEmployee = asyncHandler(async (req, res) => {
  const result = await service.editEmployee(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Edited successfully !!',
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const result = await service.deleteEmployee(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Deleted successfully !!',
  });
});

const promoteEmployee = asyncHandler(async (req, res) => {
  const result = await promotionService.promoteEmployee(
    { ...req.body, employeeId: req.params.id },
    req.user
  );
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Employee promoted successfully!!',
  });
});

const promoteEmployees = asyncHandler(async (req, res) => {
  const result = await promotionService.promoteEmployees(req.body, req.user);
  return res.status(200).json({
    success: result.failed === 0,
    data: result,
    message: `${result.promoted} promoted, ${result.failed} failed`,
  });
});

const getPromotionHistory = asyncHandler(async (req, res) => {
  const result = await promotionService.getPromotionHistory(req.params.id);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Fetched successfully !!',
  });
});

module.exports = {
  getEmployees,
  getEmployeeProfile,
  getEmployeeDetails,
  createEmployee,
  editEmployee,
  editEmployeeProfile,
  deleteEmployee,
  promoteEmployee,
  promoteEmployees,
  getPromotionHistory,
};
