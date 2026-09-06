import bcrypt from "bcryptjs";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

/*
|--------------------------------------------------------------------------
| Helper: Remove password
|--------------------------------------------------------------------------
*/
const sanitizeCustomer = (customer) => {
  const data = customer.toObject();

  delete data.password;

  return data;
};

/*
|--------------------------------------------------------------------------
| REGISTER CUSTOMER
|--------------------------------------------------------------------------
| POST /api/customer/register
| Public
|--------------------------------------------------------------------------
*/
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, profileImage, location } =
      req.body;

    // --------------------------------------------------
    // Required fields
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

    // --------------------------------------------------
    // Coordinates validation
    // --------------------------------------------------

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
    // Normalize
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // --------------------------------------------------
    // Existing email
    // --------------------------------------------------

    const existingEmail = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // --------------------------------------------------
    // Existing phone
    // --------------------------------------------------

    const existingPhone = await Customer.findOne({
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
    // Create customer
    // --------------------------------------------------

    const customer = await Customer.create({
      fullName: fullName.trim(),

      email: normalizedEmail,

      phone: normalizedPhone,

      password: hashedPassword,

      profileImage: profileImage?.trim() || "",

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

      isActive: true,
    });

    // --------------------------------------------------
    // Generate Customer JWT
    // --------------------------------------------------

    const token = generateToken(customer._id, "CUSTOMER");

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message: "Customer registered successfully",

      token,

      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Register Customer Error:", error);

    // Duplicate key
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message: `${duplicateField} is already registered`,
      });
    }

    // Mongoose validation
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
| LOGIN CUSTOMER
|--------------------------------------------------------------------------
| POST /api/customer/login
| Public
|--------------------------------------------------------------------------
*/
export const loginCustomer = async (req, res) => {
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
    // Find customer
    // --------------------------------------------------

    const customer = await Customer.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // Active account
    // --------------------------------------------------

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your customer account has been deactivated",
      });
    }

    // --------------------------------------------------
    // Password
    // --------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(password, customer.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // Generate token
    // --------------------------------------------------

    const token = generateToken(customer._id, "CUSTOMER");

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Login successful",

      token,

      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Login Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT CUSTOMER
|--------------------------------------------------------------------------
| GET /api/customer/me
| Protected - Customer
|--------------------------------------------------------------------------
*/
export const getCurrentCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Get Current Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGOUT CUSTOMER
|--------------------------------------------------------------------------
| POST /api/customer/logout
|--------------------------------------------------------------------------
*/
export const logoutCustomer = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
