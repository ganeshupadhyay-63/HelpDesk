import express from "express";

import {
  registerProvider,
  loginProvider,
  getCurrentProvider,
  logoutProvider,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerProvider);
router.post("/login", loginProvider);

// Protected routes
router.get("/me", authMiddleware, getCurrentProvider);
router.post("/logout", authMiddleware, logoutProvider);

export default router;