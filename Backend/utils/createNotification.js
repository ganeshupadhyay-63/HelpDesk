import Notification from "../models/notification.model.js";

const createNotification = async ({
  provider,
  serviceRequest = null,
  type,
  title,
  message,
}) => {
  try {
    if (!provider) {
      console.warn("Notification skipped: provider is missing");

      return null;
    }

    const notification = await Notification.create({
      provider,
      serviceRequest,
      type,
      title,
      message,
    });

    return notification;
  } catch (error) {
    /*
     * Notification failure should not break the
     * main service-request operation.
     */
    console.error("Create notification error:", error);

    return null;
  }
};

export default createNotification;
