const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    chunkSize: {
      type: Number,
      required: true,
    },
    totalChunks: {
      type: Number,
      required: true,
    },
    uploadedChunks: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ['uploading', 'paused', 'completed', 'failed'],
      default: 'uploading',
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Upload', uploadSchema);
