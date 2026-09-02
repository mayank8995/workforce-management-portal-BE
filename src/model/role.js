const mongoose = require('mongoose');
const permissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      enum: ['dashboard', 'employee', 'analytics', 'settings', 'viewmore'],
    },
    actions: [
      {
        type: String,
        required: true,
        trim: true,
        enum: ['read', 'create', 'update', 'delete'],
      },
    ],
  },
  { _id: false }
);
const levelPermissionsSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      minLength: 3,
      trim: true,
      required: true,
      unique: true,
      enum: ['junior', 'senior', 'lead', 'executive', 'guest'],
    },
    permissions: [
      {
        type: permissionSchema,
      },
    ],
  },
  { _id: false }
);
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['admin', 'employee', 'guest'],
    },
    levelPermissions: [
      {
        type: levelPermissionsSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Role', roleSchema);
