import mongoose from "mongoose";

import ServiceRequest from "../models/serviceRequest.model.js";
import Service from "../models/service.model.js";
import Provider from "../models/provider.model.js";

import calculateDistance from "../utils/distance.js";
import createNotification from "../utils/createNotification.js";

/*
|--------------------------------------------------------------------------
| CREATE SERVICE REQUEST
|--------------------------------------------------------------------------
| POST /api/service-request
| Protected - Customer
|--------------------------------------------------------------------------
*/
export const createServiceRequest = async (req, res) => {
  try {
    const customerId = req.user?.id;

    // --------------------------------------------------
    // Customer Authentication
    // --------------------------------------------------

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const {
      provider,
      service,
      customerName,
      customerPhone,
      customerLocation,
      description,
      preferredDate,
    } = req.body;

    // --------------------------------------------------
    // Required fields
    // --------------------------------------------------

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Provider is required",
      });
    }

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service is required",
      });
    }

    if (!customerName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!customerPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }

    if (!customerLocation?.address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service address is required",
      });
    }

    if (!customerLocation?.city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service city is required",
      });
    }

    // --------------------------------------------------
    // Coordinates
    // --------------------------------------------------

    const latitude = Number(customerLocation.coordinates?.latitude);

    const longitude = Number(customerLocation.coordinates?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    // --------------------------------------------------
    // Validate ObjectIds
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // --------------------------------------------------
    // Find Provider
    // --------------------------------------------------

    const providerData = await Provider.findOne({
      _id: provider,
      isActive: true,
    });

    if (!providerData) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // --------------------------------------------------
    // Check Provider Availability
    // --------------------------------------------------

    if (!providerData.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Provider is currently unavailable",
      });
    }

    // --------------------------------------------------
    // Validate Provider Location
    // --------------------------------------------------

    const providerCoordinates = providerData.location?.coordinates?.coordinates;

    if (
      !Array.isArray(providerCoordinates) ||
      providerCoordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider location coordinates are not configured",
      });
    }

    const providerLongitude = Number(providerCoordinates[0]);
    const providerLatitude = Number(providerCoordinates[1]);

    if (
      !Number.isFinite(providerLatitude) ||
      !Number.isFinite(providerLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider location coordinates are invalid",
      });
    }

    // --------------------------------------------------
    // Find Service
    // --------------------------------------------------

    const serviceData = await Service.findOne({
      _id: service,
      provider,
      isActive: true,
      isAvailable: true,
    });

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found, inactive, or unavailable",
      });
    }

    // --------------------------------------------------
    // Calculate Distance
    // --------------------------------------------------

    const distance = calculateDistance(
      latitude,
      longitude,
      providerLatitude,
      providerLongitude,
    );

    const roundedDistance = Math.round(distance * 100) / 100;

    // --------------------------------------------------
    // Check Service Radius
    // --------------------------------------------------

    const serviceRadius = Number(providerData.serviceRadius);

    if (Number.isFinite(serviceRadius) && roundedDistance > serviceRadius) {
      return res.status(400).json({
        success: false,
        message: `Customer is outside the provider's service area. Maximum service radius is ${serviceRadius} km.`,
        distance: roundedDistance,
        serviceRadius,
      });
    }

    // --------------------------------------------------
    // Calculate Travel Charge
    // --------------------------------------------------
    //
    // First 2 km = Free
    // After 2 km = Rs. 20 per chargeable km
    //
    // Example:
    // Distance = 5.4 km
    // Free = 2 km
    // Chargeable = 3.4 km
    // Charged = 4 km
    // Travel Charge = Rs. 80
    //
    // --------------------------------------------------

    const freeDistance = 2;
    const travelChargePerKm = 20;

    let travelCharge = 0;

    if (roundedDistance > freeDistance) {
      const chargeableDistance = roundedDistance - freeDistance;

      travelCharge = Math.ceil(chargeableDistance) * travelChargePerKm;
    }

    // --------------------------------------------------
    // Calculate Total Price
    // --------------------------------------------------

    const basePrice = Number(serviceData.basePrice);

    const totalPrice = basePrice + travelCharge;

    // --------------------------------------------------
    // Create Service Request
    // --------------------------------------------------

    const request = await ServiceRequest.create({
      // IMPORTANT:
      // Customer comes from authenticated JWT.
      // Never trust customer ID from frontend.
      customer: customerId,

      provider,

      service,

      customerName: customerName.trim(),

      customerPhone: customerPhone.trim(),

      customerLocation: {
        address: customerLocation.address.trim(),

        city: customerLocation.city.trim(),

        district: customerLocation.district?.trim() || "",

        coordinates: {
          latitude,
          longitude,
        },
      },

      description: description?.trim() || "",

      preferredDate: preferredDate || null,

      distance: roundedDistance,

      basePrice,

      travelCharge,

      totalPrice,

      status: "Pending",
    });

    // --------------------------------------------------
    // Create Provider Notification
    // --------------------------------------------------

    await createNotification({
      provider: request.provider,
      serviceRequest: request._id,
      type: "NEW_REQUEST",
      title: "New Service Request",
      message: `${request.customerName} requested your service.`,
    });

    // --------------------------------------------------
    // Populate Response
    // --------------------------------------------------

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("customer", "fullName email phone profileImage location")
      .populate(
        "provider",
        "fullName phone profileImage location rating totalReviews serviceRadius",
      )
      .populate("service", "name description basePrice priceUnit images");

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("CREATE SERVICE REQUEST ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Service request validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create service request",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER REQUESTS
|--------------------------------------------------------------------------
| GET /api/service-request/customer
| Protected - Customer
|--------------------------------------------------------------------------
*/
export const getCustomerRequests = async (req, res) => {
  try {
    const customerId = req.user?.id;

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    // --------------------------------------------------
    // Find Customer Requests
    // --------------------------------------------------

    const requests = await ServiceRequest.find({
      customer: customerId,
    })
      .populate(
        "provider",
        "fullName phone profileImage location rating totalReviews serviceRadius",
      )
      .populate("service", "name description basePrice priceUnit images")
      .sort({
        createdAt: -1,
      })
      .lean();

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET CUSTOMER REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer requests",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROVIDER REQUESTS
|--------------------------------------------------------------------------
| GET /api/service-request/provider
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const getProviderRequests = async (req, res) => {
  try {
    const providerId = req.user?.id;

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: "Provider authentication required",
      });
    }

    // --------------------------------------------------
    // Find Provider Requests
    // --------------------------------------------------

    const requests = await ServiceRequest.find({
      provider: providerId,
    })
      .populate("customer", "fullName email phone profileImage location")
      .populate("service", "name description basePrice priceUnit images")
      .sort({
        createdAt: -1,
      })
      .lean();

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET PROVIDER REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service requests",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE REQUEST
|--------------------------------------------------------------------------
| GET /api/service-request/:id
| Protected
|--------------------------------------------------------------------------
*/
export const getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    // --------------------------------------------------
    // Find Request
    // --------------------------------------------------

    const request = await ServiceRequest.findById(id)
      .populate("customer", "fullName email phone profileImage location")
      .populate(
        "provider",
        "fullName phone profileImage location rating totalReviews serviceRadius",
      )
      .populate("service", "name description basePrice priceUnit images");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("GET SERVICE REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service request",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE REQUEST STATUS
|--------------------------------------------------------------------------
| PUT /api/service-request/:id/status
| Protected - Provider
|--------------------------------------------------------------------------
*/
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const providerId = req.user?.id;

    const { status, providerMessage } = req.body;

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: "Provider authentication required",
      });
    }

    // --------------------------------------------------
    // Allowed Provider Statuses
    // --------------------------------------------------

    const allowedStatuses = ["Accepted", "Rejected", "Completed"];

    // --------------------------------------------------
    // Validate Request ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    // --------------------------------------------------
    // Validate Status
    // --------------------------------------------------

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed statuses are Accepted, Rejected and Completed",
      });
    }

    // --------------------------------------------------
    // Find Request Owned By Provider
    // --------------------------------------------------

    const request = await ServiceRequest.findOne({
      _id: id,
      provider: providerId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or unauthorized",
      });
    }

    // --------------------------------------------------
    // Current Status
    // --------------------------------------------------

    const currentStatus = request.status;

    // --------------------------------------------------
    // Valid Status Transitions
    // --------------------------------------------------

    const validTransitions = {
      Pending: ["Accepted", "Rejected"],
      Accepted: ["Completed"],
      Rejected: [],
      Cancelled: [],
      Completed: [],
    };

    // --------------------------------------------------
    // Check Status Transition
    // --------------------------------------------------

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change request status from ${currentStatus} to ${status}`,
        currentStatus,
        requestedStatus: status,
      });
    }

    // --------------------------------------------------
    // Validate Provider Message
    // --------------------------------------------------

    if (providerMessage !== undefined) {
      if (typeof providerMessage !== "string") {
        return res.status(400).json({
          success: false,
          message: "Provider message must be a string",
        });
      }

      if (providerMessage.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Provider message cannot exceed 500 characters",
        });
      }

      request.providerMessage = providerMessage.trim();
    }

    // --------------------------------------------------
    // Update Status
    // --------------------------------------------------

    request.status = status;

    await request.save();

    // --------------------------------------------------
    // Create Notification
    // --------------------------------------------------

    let notificationType = null;
    let notificationTitle = null;
    let notificationMessage = null;

    switch (status) {
      case "Accepted":
        notificationType = "REQUEST_ACCEPTED";
        notificationTitle = "Request Accepted";
        notificationMessage = `Your service request has been accepted by the provider.`;
        break;

      case "Rejected":
        notificationType = "REQUEST_REJECTED";
        notificationTitle = "Request Rejected";
        notificationMessage = `Your service request has been rejected by the provider.`;
        break;

      case "Completed":
        notificationType = "REQUEST_COMPLETED";
        notificationTitle = "Request Completed";
        notificationMessage = `Your service request has been marked as completed.`;
        break;

      default:
        break;
    }

    if (notificationType) {
      await createNotification({
        provider: request.provider,
        serviceRequest: request._id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
      });
    }

    // --------------------------------------------------
    // Populate Response
    // --------------------------------------------------

    const updatedRequest = await ServiceRequest.findById(request._id)
      .populate("customer", "fullName email phone profileImage location")
      .populate(
        "provider",
        "fullName phone profileImage location rating totalReviews serviceRadius",
      )
      .populate("service", "name description basePrice priceUnit images");

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: `Request status changed from ${currentStatus} to ${status} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("UPDATE REQUEST STATUS ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Request status validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update request status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL SERVICE REQUEST
|--------------------------------------------------------------------------
| PUT /api/service-request/:id/cancel
| Protected - Customer
|--------------------------------------------------------------------------
*/
export const cancelServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const customerId = req.user?.id;

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    // --------------------------------------------------
    // Find Own Request
    // --------------------------------------------------

    const request = await ServiceRequest.findOne({
      _id: id,
      customer: customerId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or unauthorized",
      });
    }

    // --------------------------------------------------
    // Only Pending Requests Can Be Cancelled
    // --------------------------------------------------

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    // --------------------------------------------------
    // Cancel Request
    // --------------------------------------------------

    request.status = "Cancelled";

    await request.save();

    // --------------------------------------------------
    // Notify Provider
    // --------------------------------------------------

    await createNotification({
      provider: request.provider,
      serviceRequest: request._id,
      type: "REQUEST_CANCELLED",
      title: "Service Request Cancelled",
      message: `${request.customerName} cancelled the service request.`,
    });

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Service request cancelled successfully",
    });
  } catch (error) {
    console.error("CANCEL SERVICE REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel service request",
    });
  }
};
