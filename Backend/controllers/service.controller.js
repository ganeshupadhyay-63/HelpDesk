import mongoose from "mongoose";
import Service from "../models/service.model.js";
import Category from "../models/category.model.js";

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/
const sanitizeService = (service) => {
  if (!service) return null;

  const data =
    typeof service.toObject === "function"
      ? service.toObject()
      : service;

  return data;
};

/*
|--------------------------------------------------------------------------
| CREATE SERVICE
|--------------------------------------------------------------------------
| POST /api/service
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const createService = async (req, res) => {
  try {
    const providerId = req.user.id;

    const {
      category,
      name,
      description,
      basePrice,
      priceUnit,
      images,
      isAvailable,
    } = req.body;

    // --------------------------------------------------
    // Required fields
    // --------------------------------------------------

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    if (basePrice === undefined || basePrice === null) {
      return res.status(400).json({
        success: false,
        message: "Base price is required",
      });
    }

    // --------------------------------------------------
    // Validate price
    // --------------------------------------------------

    const price = Number(basePrice);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be a valid number",
      });
    }

    // --------------------------------------------------
    // Validate category
    // --------------------------------------------------

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    // --------------------------------------------------
    // Validate price unit
    // --------------------------------------------------

    const allowedPriceUnits = [
      "hour",
      "day",
      "visit",
      "service",
      "trip",
      "custom",
    ];

    if (
      priceUnit &&
      !allowedPriceUnits.includes(priceUnit)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price unit",
      });
    }

    // --------------------------------------------------
    // Validate images
    // --------------------------------------------------

    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    // --------------------------------------------------
    // Create service
    // --------------------------------------------------

    const service = await Service.create({
      provider: providerId,

      category,

      name: name.trim(),

      description:
        description?.trim() || "",

      basePrice: price,

      priceUnit: priceUnit || "service",

      images: Array.isArray(images)
        ? images
        : [],

      isAvailable:
        isAvailable !== undefined
          ? Boolean(isAvailable)
          : true,

      isActive: true,
    });

    // --------------------------------------------------
    // Populate response
    // --------------------------------------------------

    const populatedService =
      await Service.findById(service._id)
        .populate(
          "category",
          "name slug description icon image"
        )
        .populate(
          "provider",
          "fullName phone profileImage location rating totalReviews isAvailable"
        );

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: sanitizeService(populatedService),
    });
  } catch (error) {
    console.error("Create Service Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Service validation failed",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY SERVICES
|--------------------------------------------------------------------------
| GET /api/service/my-services
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const getMyServices = async (req, res) => {
  try {
    const providerId = req.user.id;

    const services = await Service.find({
      provider: providerId,
    })
      .populate(
        "category",
        "name slug description icon image"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(
      "Get My Services Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your services",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SERVICE
|--------------------------------------------------------------------------
| GET /api/service/:id
| Public
|--------------------------------------------------------------------------
*/
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    })
      .populate(
        "category",
        "name slug description icon image"
      )
      .populate(
        "provider",
        "fullName phone profileImage location experience rating totalReviews isAvailable isVerified"
      )
      .lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error(
      "Get Service By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MY SERVICE
|--------------------------------------------------------------------------
| PUT /api/service/:id
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findOne({
      _id: id,
      provider: providerId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found or you do not own this service",
      });
    }

    const {
      category,
      name,
      description,
      basePrice,
      priceUnit,
      images,
      isAvailable,
    } = req.body;

    // --------------------------------------------------
    // Category
    // --------------------------------------------------

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found or inactive",
        });
      }

      service.category = category;
    }

    // --------------------------------------------------
    // Name
    // --------------------------------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Service name cannot be empty",
        });
      }

      service.name = name.trim();
    }

    // --------------------------------------------------
    // Description
    // --------------------------------------------------

    if (description !== undefined) {
      service.description =
        description.trim();
    }

    // --------------------------------------------------
    // Base Price
    // --------------------------------------------------

    if (basePrice !== undefined) {
      const price = Number(basePrice);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Base price must be a valid number",
        });
      }

      service.basePrice = price;
    }

    // --------------------------------------------------
    // Price Unit
    // --------------------------------------------------

    if (priceUnit !== undefined) {
      const allowedPriceUnits = [
        "hour",
        "day",
        "visit",
        "service",
        "trip",
        "custom",
      ];

      if (
        !allowedPriceUnits.includes(priceUnit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price unit",
        });
      }

      service.priceUnit = priceUnit;
    }

    // --------------------------------------------------
    // Images
    // --------------------------------------------------

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array",
        });
      }

      service.images = images;
    }

    // --------------------------------------------------
    // Availability
    // --------------------------------------------------

    if (isAvailable !== undefined) {
      service.isAvailable =
        Boolean(isAvailable);
    }

    await service.save();

    const updatedService =
      await Service.findById(service._id)
        .populate(
          "category",
          "name slug description icon image"
        )
        .populate(
          "provider",
          "fullName phone profileImage location rating totalReviews isAvailable"
        );

    return res.status(200).json({
      success: true,
      message:
        "Service updated successfully",
      service: sanitizeService(updatedService),
    });
  } catch (error) {
    console.error(
      "Update Service Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MY SERVICE
|--------------------------------------------------------------------------
| DELETE /api/service/:id
| Protected - Provider
|--------------------------------------------------------------------------
| Soft delete
|--------------------------------------------------------------------------
*/
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findOne({
      _id: id,
      provider: providerId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found or you do not own this service",
      });
    }

    service.isActive = false;
    service.isAvailable = false;

    await service.save();

    return res.status(200).json({
      success: true,
      message:
        "Service deactivated successfully",
    });
  } catch (error) {
    console.error(
      "Delete Service Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate service",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE SERVICE AVAILABILITY
|--------------------------------------------------------------------------
| PUT /api/service/:id/availability
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const updateServiceAvailability = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;
    const { isAvailable } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isAvailable must be true or false",
      });
    }

    const service = await Service.findOneAndUpdate(
      {
        _id: id,
        provider: providerId,
        isActive: true,
      },
      {
        isAvailable,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "category",
        "name slug description icon image"
      )
      .populate(
        "provider",
        "fullName phone profileImage isAvailable"
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found or you do not own this service",
      });
    }

    return res.status(200).json({
      success: true,
      message: isAvailable
        ? "Service is now available"
        : "Service is now unavailable",
      service: sanitizeService(service),
    });
  } catch (error) {
    console.error(
      "Update Service Availability Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update service availability",
    });
  }
};