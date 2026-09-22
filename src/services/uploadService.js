const Upload = require('../model/upload');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const createUpload = async (req, _res) => {
  const { fileName, fileSize, chunkSize } = req.body;
  const totalChunks = Math.ceil(fileSize / chunkSize);

  const upload = await Upload.create({
    fileName,
    fileSize,
    chunkSize,
    totalChunks,
  });

  return {
    uploadId: upload._id,
    totalChunks: upload.totalChunks,
  };
};

const uploadChunk = async (req, _res) => {
  const { uploadId, chunkIndex } = req.params;
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new AppError('Upload not found', 404);
  }
  if (upload.status === 'paused') {
    throw new AppError('Upload is paused', 409);
  }
  const index = Number(chunkIndex);

  if (index < 0 || index >= upload.totalChunks) {
    throw new AppError('Invalid Chunk Index', 400);
  }

  const uploadDir = path.join('uploads', uploadId);
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const chunkPath = path.join(uploadDir, `chunk-${index}`);
  //save incoming binary data
  await pipeline(req, fs.createWriteStream(chunkPath));

  if (!upload.uploadedChunks.includes(index)) {
    upload.uploadedChunks.push(index);
    await upload.save();
  }
  return { message: 'Chunk uploaded', chunkIndex: index };
};

const getUploadStatus = async (req, _res) => {
  const { uploadId } = req.params;

  const upload = await Upload.findById(uploadId);

  if (!upload) {
    throw new AppError('Upload not found', 404);
  }
  return {
    uploadId: upload._id,
    fileName: upload.fileName,
    totalChunks: upload.totalChunks,
    uploadedChunks: upload.uploadedChunks,
    status: upload.status,
  };
};

const pauseUpload = async (req, _res) => {
  const { uploadId } = req.params;
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new AppError('Upload not found', 404);
  }
  upload.status = 'paused';
  await upload.save();

  return { message: 'Upload paused' };
};
const resumeUpload = async (req, _res) => {
  const { uploadId } = req.params;
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new AppError('Upload not found', 404);
  }
  upload.status = 'uploading';
  await upload.save();

  return { message: 'Upload resumed' };
};

const completeUpload = async (req, res) => {
  const { uploadId } = req.params;
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new AppError('Upload not found', 404);
  }
  if (upload.status === 'completed') {
    return {
      message: 'Upload already completed',
    };
  }
  // check that all chunks are uploaded
  if (upload.uploadedChunks.length !== upload.totalChunks) {
    return { message: 'Not all chunks are uploaded' };
  }
  const uploadDir = path.join('uploads', uploadId);
  const finalPath = path.join('uploads', `${uploadId}-${upload.fileName}`);
  //Merge chunks
  const finalStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < upload.totalChunks; i++) {
    const chunkPath = path.join(uploadDir, `chunk-${i}`);
    await pipeline(fs.createReadStream(chunkPath), finalStream, { end: false });
  }
  finalStream.end();
  upload.status = 'completed';
  await upload.save();

  return { message: 'Upload completed', fileName: upload.fileName };
};
module.exports = {
  createUpload,
  uploadChunk,
  getUploadStatus,
  pauseUpload,
  resumeUpload,
  completeUpload,
};
