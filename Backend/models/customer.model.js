import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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
    // Customer Location
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
    // Account Status
    // =========================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// =========================
// Geospatial Index
// =========================
customerSchema.index({
  "location.coordinates": "2dsphere",
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;