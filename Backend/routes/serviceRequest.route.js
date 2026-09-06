import express from "express";

import {
  createServiceRequest,
  getCustomerRequests,
  getProviderRequests,
  getServiceRequestById,
  updateRequestStatus,
  cancelServiceRequest,
} from "../controllers/serviceRequest.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE SERVICE REQUEST
|--------------------------------------------------------------------------
| POST /api/service-request
| Protected - Customer
|--------------------------------------------------------------------------
*/
router.post("/", authMiddleware, createServiceRequest);

/*
|--------------------------------------------------------------------------
| CUSTOMER REQUESTS
|--------------------------------------------------------------------------
| GET /api/service-request/customer
| Protected - Customer
|--------------------------------------------------------------------------
*/
router.get("/customer", authMiddleware, getCustomerRequests);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createServiceRequest,
);

router.get(
  "/customer",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getCustomerRequests,
);


router.put(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  cancelServiceRequest,
);

/*
|--------------------------------------------------------------------------
| PROVIDER REQUESTS
|--------------------------------------------------------------------------
| GET /api/service-request/provider
| Protected - Provider
|--------------------------------------------------------------------------
*/
router.get("/provider", authMiddleware, getProviderRequests);

/*
|--------------------------------------------------------------------------
| UPDATE REQUEST STATUS
|--------------------------------------------------------------------------
| PUT /api/service-request/:id/status
| Protected - Provider
|--------------------------------------------------------------------------
*/
router.put("/:id/status", authMiddleware, updateRequestStatus);

/*
|--------------------------------------------------------------------------
| CANCEL SERVICE REQUEST
|--------------------------------------------------------------------------
| PUT /api/service-request/:id/cancel
| Protected - Customer
|--------------------------------------------------------------------------
*/
router.put("/:id/cancel", authMiddleware, cancelServiceRequest);

/*
|--------------------------------------------------------------------------
| GET SINGLE REQUEST
|--------------------------------------------------------------------------
| GET /api/service-request/:id
| Protected
|--------------------------------------------------------------------------
*/
router.get("/:id", authMiddleware, getServiceRequestById);

export default router;
