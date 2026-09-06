import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {

    // Customer Information

     customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    customerLocation: {
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
      },

      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },

        longitude: {
          type: Number,
          required: true,
        },
      },
    },

    // Requested Service
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    preferredDate: {
      type: Date,
    },

    // Distance & Pricing
    distance: {
      type: Number,
      min: 0,
    },

    basePrice: {
      type: Number,
      min: 0,
    },

    travelCharge: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalPrice: {
      type: Number,
      min: 0,
    },

    // Request Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Cancelled",
        "Completed",
      ],
      default: "Pending",
    },

    providerMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    
  },
  {
    timestamps: true,
  }
);

serviceRequestSchema.index({
  provider: 1,
  status: 1,
});

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;