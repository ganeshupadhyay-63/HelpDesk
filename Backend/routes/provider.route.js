import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  changePassword,
  getProviderDashboard,
  getPublicProviderProfile,
} from "../controllers/provider.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PROTECTED PROVIDER ROUTES
|--------------------------------------------------------------------------
*/

router.get("/me", authMiddleware, getMyProfile);

router.put("/me", authMiddleware, updateMyProfile);

router.get("/dashboard", authMiddleware, getProviderDashboard);

router.put("/availability", authMiddleware, updateAvailability);

router.put("/change-password", authMiddleware, changePassword);

/*
|--------------------------------------------------------------------------
| PUBLIC PROVIDER PROFILE
|--------------------------------------------------------------------------
| Customer can access without authentication
|--------------------------------------------------------------------------
*/

router.get("/:providerId", getPublicProviderProfile);

export default router;
