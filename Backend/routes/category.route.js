import express from "express";

import {
  createCategory,
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Create
router.post("/", createCategory);

// Get all
router.get("/", getAllCategories);

// Get active
router.get("/active", getActiveCategories);

// Get single
router.get("/:id", getCategoryById);

// Update
router.put("/:id", updateCategory);

// Deactivate
router.delete("/:id", deleteCategory);

export default router;