const mongoose = require('mongoose');
const validator = require('validator');
const { required } = require('zod/mini');
require('dotenv').config();
const permissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
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

module.exports = mongoose.model('Permission', permissionSchema);
