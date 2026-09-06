import express from "express";

import {
  searchNearbyProviders,
} from "../controllers/search.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Search
|--------------------------------------------------------------------------
*/

// Find nearby service providers
router.get(
  "/nearby",
  searchNearbyProviders
);

export default router;