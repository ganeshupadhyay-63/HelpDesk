import express from "express";

import {
  createServiceRequest,
  getProviderRequests,
  getServiceRequestById,
  updateRequestStatus,
  cancelServiceRequest,
} from "../controllers/serviceRequest.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/", createServiceRequest);

// Protected provider
router.get("/provider", authMiddleware, getProviderRequests);

router.put("/:id/status", authMiddleware, updateRequestStatus);

// Public
router.put("/:id/cancel", cancelServiceRequest);

router.get("/:id", getServiceRequestById);

export default router;
