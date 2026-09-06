import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Provider from "../models/provider.model.js";
import Service from "../models/service.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";
/*
|--------------------------------------------------------------------------
| Helper: Remove sensitive data
|--------------------------------------------------------------------------
*/
const sanitizeProvider = (provider) => {
  const data = provider.toObject();

  delete data.password;

  return data;
};

/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
| GET /api/provider/me
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const getMyProfile = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id).populate(
      "category",
      "name slug description icon image",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MY PROFILE
|--------------------------------------------------------------------------
| PUT /api/provider/me
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const updateMyProfile = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const {
      fullName,
      phone,
      profileImage,
      category,
      serviceName,
      description,
      experience,
      location,
      serviceRadius,
      basePrice,
      priceUnit,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
        });
      }

      provider.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty",
        });
      }

      const existingPhone = await Provider.findOne({
        phone: phone.trim(),
        _id: { $ne: provider._id },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already registered",
        });
      }

      provider.phone = phone.trim();
    }

    if (profileImage !== undefined) {
      provider.profileImage = profileImage.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Service Information
    |--------------------------------------------------------------------------
    */

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      provider.category = category;
    }

    if (serviceName !== undefined) {
      if (!serviceName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Service name cannot be empty",
        });
      }

      provider.serviceName = serviceName.trim();
    }

    if (description !== undefined) {
      provider.description = description.trim();
    }

    if (experience !== undefined) {
      const experienceValue = Number(experience);

      if (!Number.isFinite(experienceValue) || experienceValue < 0) {
        return res.status(400).json({
          success: false,
          message: "Experience must be a valid positive number",
        });
      }

      provider.experience = experienceValue;
    }

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    if (location !== undefined) {
      if (!location.address?.trim() || !location.city?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Address and city are required",
        });
      }

      if (
        !location.coordinates ||
        location.coordinates.type !== "Point" ||
        !Array.isArray(location.coordinates.coordinates) ||
        location.coordinates.coordinates.length !== 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid GeoJSON coordinates are required",
        });
      }

      const [longitude, latitude] = location.coordinates.coordinates;

      const lng = Number(longitude);
      const lat = Number(latitude);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude or latitude",
        });
      }

      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }

      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }

      provider.location = {
        address: location.address.trim(),

        city: location.city.trim(),

        district: location.district?.trim() || "",

        province: location.province?.trim() || "",

        coordinates: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Service Radius
    |--------------------------------------------------------------------------
    */

    if (serviceRadius !== undefined) {
      const radius = Number(serviceRadius);

      if (!Number.isFinite(radius) || radius < 1) {
        return res.status(400).json({
          success: false,
          message: "Service radius must be at least 1 km",
        });
      }

      provider.serviceRadius = radius;
    }

    /*
    |--------------------------------------------------------------------------
    | Pricing
    |--------------------------------------------------------------------------
    */

    if (basePrice !== undefined) {
      const price = Number(basePrice);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Base price must be a valid positive number",
        });
      }

      provider.basePrice = price;
    }

    if (priceUnit !== undefined) {
      const allowedUnits = [
        "hour",
        "day",
        "visit",
        "service",
        "trip",
        "custom",
      ];

      if (!allowedUnits.includes(priceUnit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid price unit",
        });
      }

      provider.priceUnit = priceUnit;
    }

    await provider.save();

    const updatedProvider = await Provider.findById(provider._id).populate(
      "category",
      "name slug description icon image",
    );

    return res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      provider: sanitizeProvider(updatedProvider),
    });
  } catch (error) {
    console.error("Update My Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update provider profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE AVAILABILITY
|--------------------------------------------------------------------------
| PUT /api/provider/availability
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      {
        isAvailable,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("category", "name slug description icon image");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isAvailable
        ? "You are now available for services"
        : "You are now unavailable for services",
      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    console.error("Update Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
| PUT /api/provider/change-password
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const provider = await Provider.findById(req.user.id).select("+password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      provider.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, provider.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    provider.password = await bcrypt.hash(newPassword, 12);

    await provider.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROVIDER DASHBOARD
|--------------------------------------------------------------------------
| GET /api/provider/dashboard
| Protected - Provider
|--------------------------------------------------------------------------
*/

export const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Validate provider ID
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Get Provider Information
    |--------------------------------------------------------------------------
    */

    const provider = await Provider.findOne({
      _id: providerId,
      isActive: true,
    })
      .select(
        "fullName email phone profileImage category serviceName description experience location serviceRadius basePrice priceUnit isAvailable isVerified rating totalReviews",
      )
      .populate("category", "name slug description icon image");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Request Statistics
    |--------------------------------------------------------------------------
    */

    const requestStats = await ServiceRequest.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
        },
      },

      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const requestCounts = {
      Pending: 0,
      Accepted: 0,
      Rejected: 0,
      Cancelled: 0,
      Completed: 0,
    };

    requestStats.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(requestCounts, item._id)) {
        requestCounts[item._id] = item.count;
      }
    });

    const totalRequests = Object.values(requestCounts).reduce(
      (total, count) => total + count,
      0,
    );

    /*
    |--------------------------------------------------------------------------
    | 3. Service Statistics
    |--------------------------------------------------------------------------
    */

    const serviceStats = await Service.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
        },
      },

      {
        $group: {
          _id: null,

          totalServices: {
            $sum: 1,
          },

          activeServices: {
            $sum: {
              $cond: [
                {
                  $eq: ["$isActive", true],
                },
                1,
                0,
              ],
            },
          },

          availableServices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$isActive", true],
                    },
                    {
                      $eq: ["$isAvailable", true],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const serviceSummary = serviceStats[0] || {
      totalServices: 0,
      activeServices: 0,
      availableServices: 0,
    };

    /*
    |--------------------------------------------------------------------------
    | 4. Revenue Statistics
    |--------------------------------------------------------------------------
    */

    const revenueStats = await ServiceRequest.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),

          status: "Completed",
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: {
              $ifNull: ["$totalPrice", 0],
            },
          },

          completedRequests: {
            $sum: 1,
          },
        },
      },
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      completedRequests: 0,
    };

    /*
    |--------------------------------------------------------------------------
    | 5. Recent Service Requests
    |--------------------------------------------------------------------------
    */

    const recentRequests = await ServiceRequest.find({
      provider: providerId,
    })
      .populate("service", "name description basePrice priceUnit images")
      .select(
        "customerName customerPhone customerLocation service description preferredDate distance basePrice travelCharge totalPrice status providerMessage createdAt updatedAt",
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    /*
    |--------------------------------------------------------------------------
    | 6. Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message: "Provider dashboard fetched successfully",

      dashboard: {
        /*
        |--------------------------------------------------------------------------
        | Provider
        |--------------------------------------------------------------------------
        */

        provider: sanitizeProvider(provider),

        /*
        |--------------------------------------------------------------------------
        | Request Summary
        |--------------------------------------------------------------------------
        */

        requests: {
          total: totalRequests,

          pending: requestCounts.Pending,

          accepted: requestCounts.Accepted,

          rejected: requestCounts.Rejected,

          cancelled: requestCounts.Cancelled,

          completed: requestCounts.Completed,
        },

        /*
        |--------------------------------------------------------------------------
        | Service Summary
        |--------------------------------------------------------------------------
        */

        services: {
          total: serviceSummary.totalServices,

          active: serviceSummary.activeServices,

          available: serviceSummary.availableServices,
        },

        /*
        |--------------------------------------------------------------------------
        | Revenue Summary
        |--------------------------------------------------------------------------
        */

        revenue: {
          total: revenue.totalRevenue,

          completedRequests: revenue.completedRequests,
        },

        /*
        |--------------------------------------------------------------------------
        | Rating
        |--------------------------------------------------------------------------
        */

        rating: {
          rating: provider.rating,

          totalReviews: provider.totalReviews,
        },

        /*
        |--------------------------------------------------------------------------
        | Recent Requests
        |--------------------------------------------------------------------------
        */

        recentRequests,
      },
    });
  } catch (error) {
    console.error("Get Provider Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider dashboard",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PUBLIC PROVIDER PROFILE
|--------------------------------------------------------------------------
| GET /api/provider/:providerId
| Public - Customer
|--------------------------------------------------------------------------
*/
export const getPublicProviderProfile = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });
    }

    const provider = await Provider.findOne({
      _id: providerId,
      isActive: true,
    })
      .select(
        "fullName email phone profileImage category serviceName description experience location serviceRadius basePrice priceUnit isAvailable isVerified rating totalReviews",
      )
      .populate("category", "name slug description icon image")
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      provider,
    });
  } catch (error) {
    console.error("Get Public Provider Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider profile",
    });
  }
};

export const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({
      isActive: true,
    })
      .select(
        "fullName email phone profileImage category serviceName description experience location serviceRadius basePrice priceUnit isAvailable isVerified rating totalReviews",
      )
      .populate("category", "name slug description icon image")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    console.error("Get All Providers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
    });
  }
};
