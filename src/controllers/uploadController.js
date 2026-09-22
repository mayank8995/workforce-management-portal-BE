const service = require('../services/uploadService');
const { asyncHandler } = require('../utils/asyncHandler');
const createUpload = asyncHandler(async (req, res) => {
  const response = await service.createUpload(req, res);
  return res.status(200).json({
    success: true,
    message: 'Create upload successfully',
    data: response,
  });
});
const uploadChunk = asyncHandler(async (req, res) => {
  const response = await service.uploadChunk(req, res);
  return res.status(200).json({
    success: true,
    message: response?.message || 'Chunk upload successfull',
    data: response,
  });
});
const getUploadStatus = asyncHandler(async (req, res) => {
  const response = await service.getUploadStatus(req, res);
  return res.status(200).json({
    success: true,
    message: response?.message || 'fetched chunk data successfully',
    data: response,
  });
});
const pauseUpload = asyncHandler(async (req, res) => {
  const response = await service.pauseUpload(req, res);
  return res.status(200).json({
    success: true,
    message: response?.message || 'Chunk upload paused',
    data: response,
  });
});
const resumeUpload = asyncHandler(async (req, res) => {
  const response = await service.resumeUpload(req, res);
  return res.status(200).json({
    success: true,
    message: response?.message || 'Chunk upload resumed',
    data: response,
  });
});
const completeUpload = asyncHandler(async (req, res) => {
  const response = await service.completeUpload(req, res);
  return res.status(200).json({
    success: true,
    message: response?.message || 'Complete upload successfull',
    data: response,
  });
});

module.exports = {
  createUpload,
  uploadChunk,
  getUploadStatus,
  pauseUpload,
  resumeUpload,
  completeUpload,
};
