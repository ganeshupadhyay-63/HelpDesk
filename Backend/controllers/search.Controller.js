import mongoose from "mongoose";
import Provider from "../models/provider.model.js";
import Service from "../models/service.model.js";

/*
|--------------------------------------------------------------------------
| Search Nearby Services
|--------------------------------------------------------------------------
| GET /api/search/nearby
|
| Query:
| latitude
| longitude
| category
| service
| maxDistance -> meters
| available   -> true / false
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
    // 1. Validate Location
    // --------------------------------------------------

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const searchDistance = Number(maxDistance);

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

    if (!Number.isFinite(searchDistance) || searchDistance <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxDistance must be a positive number",
      });
    }

    // --------------------------------------------------
    // 2. Validate Category
    // --------------------------------------------------

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // --------------------------------------------------
    // 3. Debug Search Input
    // --------------------------------------------------

    console.log("SEARCH INPUT:", {
      lat,
      lng,
      category,
      service,
      searchDistance,
      available,
    });

    // --------------------------------------------------
    // 4. Find Nearby Providers
    // --------------------------------------------------

    const providerQuery = {
      isActive: true,
    };

    if (available === "true") {
      providerQuery.isAvailable = true;
    }

    /*
     IMPORTANT:
     Do NOT filter provider by category here.

     A provider can have multiple services,
     and each service has its own category.
    */

    const providers = await Provider.find({
      ...providerQuery,

      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: searchDistance,
        },
      },
    })
      .populate("category", "name slug description icon image")
      .select(
        "fullName phone profileImage email category serviceName description experience location serviceRadius basePrice priceUnit isAvailable isVerified rating totalReviews",
      )
      .lean();

    console.log("NEARBY PROVIDERS:", providers.length);

    // --------------------------------------------------
    // 5. No Nearby Providers
    // --------------------------------------------------

    if (providers.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,

        search: {
          latitude: lat,
          longitude: lng,
          maxDistance: searchDistance,
          category: category || null,
          service: service?.trim() || null,
          availableOnly: available === "true",
        },

        services: [],
      });
    }

    // --------------------------------------------------
    // 6. Keep Providers Inside Their Own Service Radius
    // --------------------------------------------------

    const validProviders = [];

    for (const provider of providers) {
      const coordinates = provider?.location?.coordinates?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        continue;
      }

      const providerLng = Number(coordinates[0]);
      const providerLat = Number(coordinates[1]);

      if (!Number.isFinite(providerLng) || !Number.isFinite(providerLat)) {
        continue;
      }

      const distanceInKm = calculateDistance(
        lat,
        lng,
        providerLat,
        providerLng,
      );

      const providerRadius = Number(provider.serviceRadius);

      /*
       Provider serviceRadius is stored in KM.

       Customer must be inside provider's service radius.
      */

      if (
        Number.isFinite(providerRadius) &&
        providerRadius > 0 &&
        distanceInKm > providerRadius
      ) {
        continue;
      }

      validProviders.push({
        ...provider,
        distance: distanceInKm,
      });
    }

    // --------------------------------------------------
    // 7. Debug Valid Providers
    // --------------------------------------------------

    console.log("VALID PROVIDERS:", validProviders.length);

    console.log(
      "VALID PROVIDER DETAILS:",
      validProviders.map((provider) => ({
        id: provider._id,
        name: provider.fullName,
        isAvailable: provider.isAvailable,
        serviceRadius: provider.serviceRadius,
        distance: provider.distance,
        coordinates: provider.location?.coordinates?.coordinates,
      })),
    );

    // --------------------------------------------------
    // 8. No Provider Accepts Customer Location
    // --------------------------------------------------

    if (validProviders.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,

        search: {
          latitude: lat,
          longitude: lng,
          maxDistance: searchDistance,
          category: category || null,
          service: service?.trim() || null,
          availableOnly: available === "true",
        },

        services: [],
      });
    }

    // --------------------------------------------------
    // 9. Get Provider IDs
    // --------------------------------------------------

    const providerIds = validProviders.map((provider) => provider._id);

    // --------------------------------------------------
    // 10. Service Query
    // --------------------------------------------------

    const serviceQuery = {
      provider: {
        $in: providerIds,
      },

      isActive: true,
      isAvailable: true,
    };

    // --------------------------------------------------
    // 11. Category Belongs to SERVICE
    // --------------------------------------------------

    if (category) {
      serviceQuery.category = category;
    }

    // --------------------------------------------------
    // 12. Service Name Search
    // --------------------------------------------------

    if (service?.trim()) {
      serviceQuery.name = {
        $regex: service.trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------
    // 13. Get Actual Provider Services
    // --------------------------------------------------

    const services = await Service.find(serviceQuery)
      .populate("category", "name slug description icon image")
      .lean();

    // --------------------------------------------------
    // 14. Debug Service Result
    // --------------------------------------------------

    console.log("SERVICE QUERY:", serviceQuery);
    console.log("MATCHING SERVICES:", services.length);

    // --------------------------------------------------
    // 15. Create Final Customer Results
    // --------------------------------------------------

    const results = [];

    for (const serviceItem of services) {
      const provider = validProviders.find(
        (item) => item._id.toString() === serviceItem.provider.toString(),
      );

      if (!provider) {
        continue;
      }

      results.push({
        // --------------------------------------------------
        // Service
        // --------------------------------------------------

        _id: serviceItem._id,

        name: serviceItem.name,

        serviceName: serviceItem.name,

        description: serviceItem.description || provider.description || "",

        category: serviceItem.category || provider.category || null,

        basePrice: serviceItem.basePrice ?? provider.basePrice ?? null,

        priceUnit: serviceItem.priceUnit || provider.priceUnit || "service",

        images: Array.isArray(serviceItem.images) ? serviceItem.images : [],

        isAvailable: serviceItem.isAvailable === true,

        // --------------------------------------------------
        // Provider
        // --------------------------------------------------

        providerId: provider._id,

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
        // Distance
        // --------------------------------------------------

        distance: provider.distance,
      });
    }

    // --------------------------------------------------
    // 16. Sort Nearest First
    // --------------------------------------------------

    results.sort((a, b) => {
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    });

    // --------------------------------------------------
    // 17. Final Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      count: results.length,

      search: {
        latitude: lat,
        longitude: lng,
        maxDistance: searchDistance,
        category: category || null,
        service: service?.trim() || null,
        availableOnly: available === "true",
      },

      services: results,
    });
  } catch (error) {
    console.error("Search Nearby Services Error:", error);

    if (error?.code === 2 || error?.message?.includes("2dsphere")) {
      return res.status(500).json({
        success: false,
        message:
          "Location search requires a valid 2dsphere index on provider coordinates",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to search nearby services",
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
