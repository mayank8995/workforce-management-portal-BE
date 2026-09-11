const service = require('../services/employeeService');
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

const promoteEmployees = asyncHandler(async (req, res) => {
  const result = await service.promoteEmployees(req);
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Employees promoted successfully!!',
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
  promoteEmployees,
};
