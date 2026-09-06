import bcrypt from "bcryptjs";
import Provider from "../models/provider.model.js";
import generateToken from "../utils/generateToken.js";

/*
|--------------------------------------------------------------------------
| Helper: Remove password
|--------------------------------------------------------------------------
*/
const sanitizeProvider = (provider) => {
  const data = provider.toObject();

  delete data.password;

  return data;
};

/*
|--------------------------------------------------------------------------
| REGISTER PROVIDER
|--------------------------------------------------------------------------
| POST /api/auth/register
| Public
*/
export const registerProvider = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
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

    // --------------------------------------------------
    // Required field validation
    // --------------------------------------------------

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!serviceName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    if (!location.address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!location.city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
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
        message: "Valid location coordinates are required",
      });
    }

    // --------------------------------------------------
    // Coordinate validation
    // --------------------------------------------------

    const [longitude, latitude] = location.coordinates.coordinates;

    if (
      !Number.isFinite(Number(longitude)) ||
      !Number.isFinite(Number(latitude))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude or latitude",
      });
    }

    if (Number(longitude) < -180 || Number(longitude) > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    if (Number(latitude) < -90 || Number(latitude) > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    // --------------------------------------------------
    // Password validation
    // --------------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // --------------------------------------------------
    // Email normalization
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedPhone = phone.trim();

    // --------------------------------------------------
    // Check existing email
    // --------------------------------------------------

    const existingEmail = await Provider.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // --------------------------------------------------
    // Check existing phone
    // --------------------------------------------------

    const existingPhone = await Provider.findOne({
      phone: normalizedPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // --------------------------------------------------
    // Hash password
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // --------------------------------------------------
    // Create provider
    // --------------------------------------------------

    const provider = await Provider.create({
      fullName: fullName.trim(),

      email: normalizedEmail,

      phone: normalizedPhone,

      password: hashedPassword,

      profileImage: profileImage?.trim() || "",

      category,

      serviceName: serviceName.trim(),

      description: description?.trim() || "",

      experience: experience !== undefined ? Number(experience) : 0,

      location: {
        address: location.address.trim(),

        city: location.city.trim(),

        district: location.district?.trim() || "",

        province: location.province?.trim() || "",

        coordinates: {
          type: "Point",

          coordinates: [Number(longitude), Number(latitude)],
        },
      },

      serviceRadius: serviceRadius !== undefined ? Number(serviceRadius) : 10,

      basePrice: basePrice !== undefined ? Number(basePrice) : 0,

      priceUnit: priceUnit || "service",

      isAvailable: true,

      isVerified: false,

      isActive: true,
    });

    // --------------------------------------------------
    // Generate JWT
    // --------------------------------------------------

    const token = generateToken(provider._id);

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Service provider registered successfully",

      token,

      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    console.error("Register Provider Error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message: `${duplicateField} is already registered`,
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN PROVIDER
|--------------------------------------------------------------------------
| POST /api/auth/login
| Public
*/
export const loginProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------
    // Find provider
    //
    // password has select:false in model,
    // therefore explicitly select it.
    // --------------------------------------------------

    const provider = await Provider.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!provider) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // Check active account
    // --------------------------------------------------

    if (!provider.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your provider account has been deactivated",
      });
    }

    // --------------------------------------------------
    // Compare password
    // --------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(password, provider.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // Generate token
    // --------------------------------------------------

    const token = generateToken(provider._id);

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    console.error("Login Provider Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT PROVIDER
|--------------------------------------------------------------------------
| GET /api/auth/me
| Protected - PROVIDER
*/
export const getCurrentProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id).populate(
      "category",
      "name slug description icon image",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    console.error("Get Current Provider Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load provider profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
| POST /api/auth/logout
|
| JWT is stored on frontend, so logout is handled
| by removing the token from client side.
|--------------------------------------------------------------------------
*/
export const logoutProvider = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
