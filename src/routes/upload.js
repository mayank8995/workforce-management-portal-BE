const express = require('express');
const uploadRouter = express.Router();

const uploadController = require('../controllers/uploadController');

uploadRouter.post('/uploads', uploadController.createUpload);
uploadRouter.get('/uploads/:uploadId', uploadController.getUploadStatus);
uploadRouter.put(
  '/uploads/:uploadId/chunks/:chunkIndex',
  uploadController.uploadChunk
);
uploadRouter.patch('/uploads/:uploadId/pause', uploadController.pauseUpload);
uploadRouter.patch('/uploads/:uploadId/resume', uploadController.resumeUpload);
uploadRouter.post(
  '/uploads/:uploadId/complete',
  uploadController.completeUpload
);

module.exports = uploadRouter;
