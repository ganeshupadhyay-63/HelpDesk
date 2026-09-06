import express from "express";

import {
  createService,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceAvailability,
} from "../controllers/service.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleware, createService);

router.get("/my-services", authMiddleware, getMyServices);

router.put("/:id/availability", authMiddleware, updateServiceAvailability);

router.put("/:id", authMiddleware, updateService);

router.delete("/:id", authMiddleware, deleteService);

// Public route
router.get("/:id", getServiceById);

export default router;
