import mongoose from "mongoose";
import Provider from "../models/provider.model.js";
import Service from "../models/service.model.js";

/*
|--------------------------------------------------------------------------
| Search Nearby Providers / Services
|--------------------------------------------------------------------------
| GET /api/search/nearby
|
| Query Parameters:
| latitude
| longitude
| category
| service
| maxDistance   -> meters
| available     -> true / false
|--------------------------------------------------------------------------
*/

export const searchNearbyProviders = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      category,
      service,
      maxDistance = 20000,
      available = "true",
    } = req.query;

    // --------------------------------------------------
    // 1. Validate Latitude & Longitude
    // --------------------------------------------------

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const distance = Number(maxDistance);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    // --------------------------------------------------
    // 2. Validate Maximum Distance
    // --------------------------------------------------

    if (!Number.isFinite(distance) || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxDistance must be a positive number",
      });
    }

    // --------------------------------------------------
    // 3. Provider Query
    // --------------------------------------------------

    const providerQuery = {
      isActive: true,
    };

    // Only available providers
    if (available === "true") {
      providerQuery.isAvailable = true;
    }

    // --------------------------------------------------
    // 4. Category Filter
    // --------------------------------------------------

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      providerQuery.category = category;
    }

    // --------------------------------------------------
    // 5. Nearby Provider Search
    // --------------------------------------------------
    //
    // GeoJSON coordinates:
    //
    // [longitude, latitude]
    //
    // Example:
    // [80.5931, 28.9639]
    //
    // $maxDistance is in meters.
    // --------------------------------------------------

    const providers = await Provider.find({
      ...providerQuery,

      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
    })
      .populate("category", "name slug description icon image")
      .select(
        "fullName phone profileImage email category serviceName description experience location serviceRadius basePrice priceUnit isAvailable isVerified rating totalReviews",
      )
      .lean();

    // --------------------------------------------------
    // 6. Get Provider IDs
    // --------------------------------------------------

    const providerIds = providers.map((provider) => provider._id);

    // If no providers found
    if (providerIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,

        search: {
          latitude: lat,
          longitude: lng,
          maxDistance: distance,
          category: category || null,
          service: service?.trim() || null,
          availableOnly: available === "true",
        },

        services: [],
      });
    }

    // --------------------------------------------------
    // 7. Service Query
    // --------------------------------------------------

    const serviceQuery = {
      provider: {
        $in: providerIds,
      },

      isActive: true,
      isAvailable: true,
    };

    // --------------------------------------------------
    // 8. Service Name Filter
    // --------------------------------------------------

    if (service?.trim()) {
      serviceQuery.name = {
        $regex: service.trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------
    // 9. Find Services
    // --------------------------------------------------

    const services = await Service.find(serviceQuery)
      .populate("category", "name slug description icon image")
      .lean();

    // --------------------------------------------------
    // 10. Build Final Results
    // --------------------------------------------------

    const results = [];

    for (const provider of providers) {
      // --------------------------------------------------
      // Get Provider Services
      // --------------------------------------------------

      const providerServices = services.filter(
        (item) => item.provider?.toString() === provider._id.toString(),
      );

      // --------------------------------------------------
      // If service filter exists but provider has
      // no matching service -> skip provider
      // --------------------------------------------------

      if (service?.trim() && providerServices.length === 0) {
        continue;
      }

      // --------------------------------------------------
      // 11. Get Provider Coordinates
      // --------------------------------------------------
      //
      // Correct structure:
      //
      // provider.location.coordinates.coordinates
      //
      // Example:
      //
      // {
      //   type: "Point",
      //   coordinates: [80.5931, 28.9639]
      // }
      //
      // --------------------------------------------------

      let distanceInKm = null;

      const providerCoordinates = provider?.location?.coordinates?.coordinates;

      if (
        Array.isArray(providerCoordinates) &&
        providerCoordinates.length === 2
      ) {
        // GeoJSON order
        const providerLng = Number(providerCoordinates[0]);

        const providerLat = Number(providerCoordinates[1]);

        if (Number.isFinite(providerLng) && Number.isFinite(providerLat)) {
          // --------------------------------------------------
          // Calculate distance
          // --------------------------------------------------

          distanceInKm = calculateDistance(lat, lng, providerLat, providerLng);
        }
      }

      // --------------------------------------------------
      // 12. Provider Service Radius
      // --------------------------------------------------
      //
      // serviceRadius is stored in KM.
      //
      // Example:
      // serviceRadius = 10
      //
      // Provider accepts customers within 10 KM.
      //
      // If distance is greater than provider's radius,
      // provider will not be returned.
      // --------------------------------------------------

      const providerRadius = Number(provider.serviceRadius);

      if (
        distanceInKm !== null &&
        Number.isFinite(providerRadius) &&
        providerRadius > 0 &&
        distanceInKm > providerRadius
      ) {
        continue;
      }

      // --------------------------------------------------
      // 13. Create One Result Per Service
      // --------------------------------------------------

      providerServices.forEach((serviceItem) => {
        results.push({
          // --------------------------------------------------
          // Service ID
          // --------------------------------------------------

          _id: serviceItem._id,

          // --------------------------------------------------
          // Provider ID
          // --------------------------------------------------

          providerId: provider._id,

          // --------------------------------------------------
          // Provider Information
          // --------------------------------------------------

          provider: {
            _id: provider._id,

            fullName: provider.fullName,

            phone: provider.phone,

            email: provider.email,

            profileImage: provider.profileImage,

            category: provider.category,

            serviceName: provider.serviceName,

            description: provider.description,

            experience: provider.experience,

            // Complete location
            location: provider.location,

            serviceRadius: provider.serviceRadius,

            basePrice: provider.basePrice,

            priceUnit: provider.priceUnit,

            isAvailable: provider.isAvailable,

            isVerified: provider.isVerified,

            rating: provider.rating || 0,

            totalReviews: provider.totalReviews || 0,
          },

          // --------------------------------------------------
          // Service Information
          // --------------------------------------------------

          name: serviceItem.name,

          serviceName: serviceItem.name,

          description: serviceItem.description || provider.description || "",

          category: serviceItem.category || provider.category,

          basePrice: serviceItem.basePrice ?? provider.basePrice,

          priceUnit: serviceItem.priceUnit || provider.priceUnit || "service",

          images: Array.isArray(serviceItem.images) ? serviceItem.images : [],

          isAvailable: serviceItem.isAvailable,

          // --------------------------------------------------
          // Distance
          // --------------------------------------------------

          distance: distanceInKm,
        });
      });
    }

    // --------------------------------------------------
    // 14. Sort Results By Distance
    // --------------------------------------------------

    results.sort((a, b) => {
      const distanceA = a.distance ?? Infinity;

      const distanceB = b.distance ?? Infinity;

      return distanceA - distanceB;
    });

    // --------------------------------------------------
    // 15. Final Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      count: results.length,

      search: {
        latitude: lat,

        longitude: lng,

        maxDistance: distance,

        category: category || null,

        service: service?.trim() || null,

        availableOnly: available === "true",
      },

      services: results,
    });
  } catch (error) {
    console.error("Search Nearby Providers Error:", error);

    // --------------------------------------------------
    // MongoDB Geospatial Error
    // --------------------------------------------------

    if (error?.code === 2 || error?.message?.includes("2dsphere")) {
      return res.status(500).json({
        success: false,
        message:
          "Location search requires a valid 2dsphere index on provider coordinates",
      });
    }

    // --------------------------------------------------
    // General Error
    // --------------------------------------------------

    return res.status(500).json({
      success: false,
      message: "Failed to search nearby service providers",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Calculate Distance
|--------------------------------------------------------------------------
| Haversine Formula
|
| Returns distance in KM
|--------------------------------------------------------------------------
*/

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const latitude1 = (lat1 * Math.PI) / 180;

  const latitude2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadius * c).toFixed(2));
};
