import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Notification recipient
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },

    // Request related to this notification
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: null,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "NEW_REQUEST",
        "REQUEST_ACCEPTED",
        "REQUEST_REJECTED",
        "REQUEST_CANCELLED",
        "REQUEST_COMPLETED",
        "PROVIDER_MESSAGE",
        "GENERAL",
      ],
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Read/unread state
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Faster provider notification queries
notificationSchema.index({
  provider: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  provider: 1,
  createdAt: -1,
});

export default mongoose.model("Notification", notificationSchema);
