import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      enum: [
        "hour",
        "day",
        "visit",
        "service",
        "trip",
        "custom",
      ],
      default: "service",
    },

    images: [
      {
        type: String,
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({
  provider: 1,
  category: 1,
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;