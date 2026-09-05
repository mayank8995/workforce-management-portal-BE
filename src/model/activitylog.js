const mongoose = require('mongoose');
const activityErrorSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,
  },
});
const activitylogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 20,
    },
    timestamp: {
      type: String,
    },
    error: {
      type: activityErrorSchema,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activitylogs', activitylogSchema);
