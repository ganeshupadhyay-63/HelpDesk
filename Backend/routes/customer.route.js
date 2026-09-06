import express from "express";

import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  logoutCustomer,
} from "../controllers/customer.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// ==================================================
// Public Routes
// ==================================================

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

// ==================================================
// Protected Routes
// ==================================================

router.get("/me", authMiddleware, getCurrentCustomer);

router.post("/logout", authMiddleware, logoutCustomer);

export default router;
