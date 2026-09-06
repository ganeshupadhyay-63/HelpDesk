import express from "express";

import {
  getProviderNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Provider Notifications
|--------------------------------------------------------------------------
*/

// Get all notifications
router.get("/provider", authMiddleware, getProviderNotifications);

// Get unread count
router.get(
  "/provider/unread-count",
  authMiddleware,
  getUnreadNotificationCount,
);

// Mark one as read
router.put("/:id/read", authMiddleware, markNotificationAsRead);

// Mark all as read
router.put("/provider/read-all", authMiddleware, markAllNotificationsAsRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
