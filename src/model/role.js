const mongoose = require('mongoose');
const validator = require('validator');
require('dotenv').config();
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    levelPermissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LevelPermission',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Role', roleSchema);
