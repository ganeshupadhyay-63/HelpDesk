import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    // =========================
    // Basic Information
    // =========================
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // =========================
    // Service Information
    // =========================
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    experience: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =========================
    // Location
    // =========================
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
        default: "",
      },

      province: {
        type: String,
        trim: true,
        default: "",
      },

      // GeoJSON Point
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },

        // [longitude, latitude]
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function (value) {
              return value.length === 2;
            },
            message: "Coordinates must contain [longitude, latitude]",
          },
        },
      },
    },

    // =========================
    // Service Area
    // =========================
    serviceRadius: {
      type: Number,
      default: 10,
      min: 1,
    },

    // =========================
    // Pricing
    // =========================
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      enum: ["hour", "day", "visit", "service", "trip", "custom"],
      default: "service",
    },

    // =========================
    // Availability
    // =========================
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // =========================
    // Verification
    // =========================
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // Rating
    // =========================
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// =========================
// Geospatial Index
// =========================
providerSchema.index({
  "location.coordinates": "2dsphere",
});

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;
