const mongoose = require('mongoose');
require('dotenv').config();

const levelPermissionsSchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      minLength: 3,
      trim: true,
      required: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LevelPermission', levelPermissionsSchema);
