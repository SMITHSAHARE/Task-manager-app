const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'USER_DELETED',
        'USER_STATUS_UPDATED',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
