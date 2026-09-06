import mongoose from "mongoose";
import Category from "../models/category.model.js";

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
| POST /api/category
| Public for now
*/
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      icon,
      image,
      isActive,
    } = req.body;

    // Required fields
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!slug?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    // Check duplicate name
    const existingName = await Category.findOne({
      name: normalizedName,
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Check duplicate slug
    const existingSlug = await Category.findOne({
      slug: normalizedSlug,
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    // Create category
    const category = await Category.create({
      name: normalizedName,
      slug: normalizedSlug,
      description: description?.trim() || "",
      icon: icon?.trim() || "",
      image: image?.trim() || "",
      isActive:
        isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    if (error.code === 11000) {
      const field =
        Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Category validation failed",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
| GET /api/category
*/
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE CATEGORIES
|--------------------------------------------------------------------------
| GET /api/category/active
*/
export const getActiveCategories = async (
  req,
  res
) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(
      "Get Active Categories Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active categories",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE CATEGORY
|--------------------------------------------------------------------------
| GET /api/category/:id
|--------------------------------------------------------------------------
*/
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "Get Category By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
| PUT /api/category/:id
|--------------------------------------------------------------------------
*/
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      icon,
      image,
      isActive,
    } = req.body;

    // Update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      const normalizedName = name.trim();

      const duplicateName = await Category.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.name = normalizedName;
    }

    // Update slug
    if (slug !== undefined) {
      if (!slug.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category slug cannot be empty",
        });
      }

      const normalizedSlug =
        slug.trim().toLowerCase();

      const duplicateSlug = await Category.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        return res.status(409).json({
          success: false,
          message: "Category slug already exists",
        });
      }

      category.slug = normalizedSlug;
    }

    if (description !== undefined) {
      category.description =
        description.trim();
    }

    if (icon !== undefined) {
      category.icon = icon.trim();
    }

    if (image !== undefined) {
      category.image = image.trim();
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Update Category Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
| DELETE /api/category/:id
|--------------------------------------------------------------------------
| Soft delete: category remains in database but becomes inactive.
|--------------------------------------------------------------------------
*/
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = false;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Delete Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate category",
    });
  }
};