import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTool,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { getActiveCategories } from "../../services/category.api";
import { searchNearbyServices } from "../../services/search.api";

/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_RADIUS = 20;

const RADIUS_OPTIONS = [5, 10, 20, 30, 50, 75, 100, 150, 200];

/* =========================================================
   LOCATION
========================================================= */

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = "Unable to get your location.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  });

/* =========================================================
   HELPERS
========================================================= */

const formatDistance = (distance) => {
  if (distance === undefined || distance === null || distance === "") {
    return "Distance unavailable";
  }

  const value = Number(distance);

  if (!Number.isFinite(value)) {
    return "Distance unavailable";
  }

  if (value < 1) {
    return `${Math.round(value * 1000)} m away`;
  }

  return `${value.toFixed(1)} km away`;
};

const formatPrice = (price) => {
  if (price === undefined || price === null || price === "") {
    return "Price not set";
  }

  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "Price not set";
  }

  return `Rs. ${value.toLocaleString("en-IN")}`;
};

const getProviderId = (service) =>
  service?.providerId || service?.provider?._id || service?.provider?.id || "";

const getProviderName = (service) =>
  service?.provider?.fullName ||
  service?.provider?.name ||
  service?.fullName ||
  service?.providerName ||
  "Service Provider";

const getProviderPhone = (service) =>
  service?.provider?.phone || service?.phone || "";

const getServiceName = (service) =>
  service?.name ||
  service?.serviceName ||
  service?.provider?.serviceName ||
  "Service";

const getCategoryName = (service) => {
  if (service?.category && typeof service.category === "object") {
    return service.category.name || "General Service";
  }

  if (
    service?.provider?.category &&
    typeof service.provider.category === "object"
  ) {
    return service.provider.category.name || "General Service";
  }

  return (
    service?.categoryName ||
    service?.provider?.categoryName ||
    "General Service"
  );
};

const getDescription = (service) =>
  service?.description ||
  service?.serviceDescription ||
  service?.provider?.description ||
  "Professional local service available near you.";

const getAvailability = (service) => {
  if (service?.isAvailable !== undefined) {
    return service.isAvailable === true;
  }

  if (service?.provider?.isAvailable !== undefined) {
    return service.provider.isAvailable === true;
  }

  if (service?.available !== undefined) {
    return service.available === true;
  }

  return true;
};

const getImage = (service) =>
  service?.images?.[0] ||
  service?.image ||
  service?.provider?.profileImage ||
  service?.profileImage ||
  "";

const getRating = (service) => {
  const rating = service?.rating ?? service?.provider?.rating ?? 0;

  const value = Number(rating);

  return Number.isFinite(value) ? value : 0;
};

const getReviewCount = (service) => {
  const reviews =
    service?.totalReviews ??
    service?.provider?.totalReviews ??
    service?.reviewCount ??
    0;

  const value = Number(reviews);

  return Number.isFinite(value) ? value : 0;
};

const getExperience = (service) => {
  const experience = service?.experience ?? service?.provider?.experience;

  if (experience === undefined || experience === null || experience === "") {
    return null;
  }

  const value = Number(experience);

  return Number.isFinite(value) ? value : null;
};

const getPrice = (service) =>
  service?.basePrice ??
  service?.price ??
  service?.provider?.basePrice ??
  service?.provider?.price ??
  null;

const getPriceUnit = (service) =>
  service?.priceUnit || service?.provider?.priceUnit || "service";

const getCoordinates = (service) => {
  const coordinates =
    service?.location?.coordinates?.coordinates ||
    service?.provider?.location?.coordinates?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  return coordinates;
};

/* =========================================================
   SEARCH PAGE
========================================================= */

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);

  const [services, setServices] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );

  const [serviceQuery, setServiceQuery] = useState(
    searchParams.get("service") || "",
  );

  const [radius, setRadius] = useState(
    Number(searchParams.get("radius")) || DEFAULT_RADIUS,
  );

  const [location, setLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");

  const [searched, setSearched] = useState(false);

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryLoading(true);

        const response = await getActiveCategories();

        if (response?.success) {
          setCategories(response.categories || []);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Category loading error:", err);

        setCategories([]);

        toast.error("Unable to load service categories.");
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  /* =======================================================
     GET LOCATION
  ======================================================= */

  const handleGetLocation = async (showToast = true) => {
    try {
      setLocationLoading(true);
      setError("");

      const currentLocation = await getCurrentLocation();

      setLocation(currentLocation);

      if (showToast) {
        toast.success("Your location has been detected.");
      }

      return currentLocation;
    } catch (err) {
      console.error("Location error:", err);

      const message = err?.message || "Unable to detect your location.";

      setError(message);

      if (showToast) {
        toast.error(message);
      }

      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = async (event) => {
    event?.preventDefault();

    setError("");
    setSearched(true);
    setServices([]);

    try {
      let currentLocation = location;

      /*
       Automatically detect location
       if user has not detected it yet.
      */

      if (!currentLocation) {
        currentLocation = await handleGetLocation(false);

        if (!currentLocation) {
          return;
        }

        toast.success("Location detected. Finding nearby services...");
      }

      setLoading(true);

      /*
       Backend expects maxDistance in meters.
       Radius selected by user is in kilometers.
      */

      const params = {
        latitude: currentLocation.latitude,

        longitude: currentLocation.longitude,

        maxDistance: Number(radius) * 1000,

        available: true,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (serviceQuery.trim()) {
        params.service = serviceQuery.trim();
      }

      console.log("Search params:", params);

      const response = await searchNearbyServices(params);

      console.log("Search response:", response);

      if (!response?.success) {
        setServices([]);

        setError(response?.message || "No services found.");

        return;
      }

      /*
       Backend response:

       results: [
         {
           provider: {...},
           services: [...]
         }
       ]

       Convert it into individual
       service cards.
      */

      const results = Array.isArray(response.services)
        ? response.services.map((service) => ({
            ...service,
            providerId: service?.providerId || service?.provider?._id || "",
            fullName: service?.provider?.fullName || "Service Provider",
            phone: service?.provider?.phone || "",
            profileImage: service?.provider?.profileImage || "",
            rating: service?.rating ?? service?.provider?.rating ?? 0,
            totalReviews:
              service?.totalReviews ?? service?.provider?.totalReviews ?? 0,
            experience:
              service?.experience ?? service?.provider?.experience ?? null,
            basePrice:
              service?.basePrice ?? service?.provider?.basePrice ?? null,
            priceUnit:
              service?.priceUnit || service?.provider?.priceUnit || "service",
            location: service?.provider?.location || null,
            category: service?.category || service?.provider?.category || null,
            distance: service?.distance ?? null,
          }))
        : [];

      setServices(results);

      /*
       Keep filters in URL
      */

      const newParams = {
        radius: String(radius),
      };

      if (selectedCategory) {
        newParams.category = selectedCategory;
      }

      if (serviceQuery.trim()) {
        newParams.service = serviceQuery.trim();
      }

      setSearchParams(newParams, { replace: true });

      if (results.length === 0) {
        toast.info(`No available services found within ${radius} km.`);
      } else {
        toast.success(
          `${results.length} service${results.length > 1 ? "s" : ""} found.`,
        );
      }
    } catch (err) {
      console.error("Service search error:", err);

      const message =
        err?.response?.data?.message || "Unable to search nearby services.";

      setServices([]);
      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setSelectedCategory("");
    setServiceQuery("");
    setRadius(DEFAULT_RADIUS);
    setServices([]);
    setError("");
    setSearched(false);

    /*
     Keep detected location.
     This means user does not need to
     give location permission again.
    */

    setSearchParams({}, { replace: true });
  };

  /* =======================================================
     SORT RESULTS
  ======================================================= */

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const distanceA = Number(a?.distance ?? Infinity);

      const distanceB = Number(b?.distance ?? Infinity);

      return distanceA - distanceB;
    });
  }, [services]);

  /* =======================================================
     PROVIDER COUNT
  ======================================================= */

  const providerCount = useMemo(() => {
    return new Set(
      services.map((service) => getProviderId(service)).filter(Boolean),
    ).size;
  }, [services]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FiTool size={21} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                HelpDesk
              </h1>

              <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
                Find trusted local services
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiArrowLeft size={17} />

            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE TITLE */}

        <div className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <FiNavigation size={13} />
            Nearby Services
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Find a trusted service near you
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Search local professionals based on your location, service category
            and preferred search radius.
          </p>
        </div>

        {/* =================================================
            SEARCH PANEL
        ================================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FiSearch size={19} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Search nearby services
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Find available providers around your current location.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-12">
              {/* CATEGORY */}

              <div className="lg:col-span-4">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Service Category
                </label>

                <div className="relative">
                  <FiBriefcase className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={categoryLoading}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                  >
                    <option value="">
                      {categoryLoading
                        ? "Loading categories..."
                        : "All Categories"}
                    </option>

                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SERVICE */}

              <div className="lg:col-span-4">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Service
                </label>

                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    placeholder="e.g. AC Repair, Plumbing..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* RADIUS */}

              <div className="lg:col-span-4">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Search Radius
                </label>

                <div className="relative">
                  <FiNavigation className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    {RADIUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        Within {value} km
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* LOCATION */}

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <FiMapPin size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Search Location
                    </p>

                    {location ? (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        Current location detected
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        Detect your location to find nearby providers
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGetLocation(true)}
                  disabled={locationLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationLoading ? (
                    <>
                      <FiRefreshCw size={16} className="animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <FiNavigation size={16} />
                      {location ? "Update Location" : "Detect Location"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                <FiXCircle className="mt-0.5 shrink-0 text-red-500" />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Search failed
                  </p>

                  <p className="mt-1 text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="h-12 rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loading || locationLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiRefreshCw size={17} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch size={17} />
                    Find Services
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        {searched && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Nearby Services
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Finding available providers..."
                  : `${sortedServices.length} service${
                      sortedServices.length === 1 ? "" : "s"
                    } found within ${radius} km`}
              </p>
            </div>

            {!loading && sortedServices.length > 0 && (
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <FiUser size={13} />
                  {providerCount} provider
                  {providerCount === 1 ? "" : "s"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  <FiCheckCircle size={13} />
                  Available
                </span>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-48 animate-pulse bg-slate-100" />

                <div className="space-y-4 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                  <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        {!loading && searched && sortedServices.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedServices.map((service) => {
              const providerId = getProviderId(service);

              const providerName = getProviderName(service);

              const serviceName = getServiceName(service);

              const categoryName = getCategoryName(service);

              const description = getDescription(service);

              const available = getAvailability(service);

              const image = getImage(service);

              const rating = getRating(service);

              const reviewCount = getReviewCount(service);

              const experience = getExperience(service);

              const phone = getProviderPhone(service);

              const price = getPrice(service);

              const priceUnit = getPriceUnit(service);

              const coordinates = getCoordinates(service);

              const hasCoordinates =
                Array.isArray(coordinates) && coordinates.length >= 2;

              const mapsUrl = hasCoordinates
                ? `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`
                : null;

              return (
                <article
                  key={service._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  {/* IMAGE */}

                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {image ? (
                      <img
                        src={image}
                        alt={serviceName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <FiTool size={30} />
                        </div>
                      </div>
                    )}

                    {/* CATEGORY */}

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
                        {categoryName}
                      </span>
                    </div>

                    {/* AVAILABILITY */}

                    <div className="absolute right-4 top-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${
                          available
                            ? "bg-green-50 text-green-700"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            available ? "bg-green-500" : "bg-slate-400"
                          }`}
                        />

                        {available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    {/* TITLE */}

                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="line-clamp-1 text-lg font-extrabold text-slate-900">
                          {serviceName}
                        </h4>

                        {service?.provider?.isVerified && (
                          <span
                            title="Verified Provider"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
                          >
                            <FiCheck size={14} />
                          </span>
                        )}
                      </div>

                      {/* PROVIDER */}

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600">
                          {service?.provider?.profileImage ? (
                            <img
                              src={service.provider.profileImage}
                              alt={providerName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FiUser size={14} />
                          )}
                        </div>

                        <span className="line-clamp-1 text-xs font-semibold text-slate-600">
                          {providerName}
                        </span>
                      </div>
                    </div>

                    {/* RATING */}

                    <div className="mb-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700">
                        <FiStar size={13} className="fill-current" />

                        {rating > 0 ? rating.toFixed(1) : "New"}

                        {reviewCount > 0 && (
                          <span className="font-medium">({reviewCount})</span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                        <FiMapPin size={13} />

                        {formatDistance(service.distance)}
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="mb-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                      {description}
                    </p>

                    {/* INFO */}

                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <FiBriefcase size={13} />
                          Experience
                        </div>

                        <p className="text-sm font-bold text-slate-700">
                          {experience !== null && experience !== undefined
                            ? `${experience} years`
                            : "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <FiTool size={13} />
                          Price
                        </div>

                        <p className="text-sm font-bold text-slate-700">
                          {formatPrice(price)}
                        </p>

                        {price !== null && (
                          <p className="text-[10px] text-slate-400">
                            per {priceUnit}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PHONE */}

                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      >
                        <FiPhone size={14} />

                        {phone}
                      </a>
                    )}

                    {/* MAP */}

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FiMapPin size={14} />
                        View Location
                        <FiArrowRight className="ml-auto" size={13} />
                      </a>
                    )}

                    {/* ACTIONS */}

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/service/${service._id}`}
                        state={{
                          service,
                          customerLocation: location,
                        }}
                        className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Service
                        <FiArrowRight size={14} />
                      </Link>

                      {providerId ? (
                        <Link
                          to={`/provider/${providerId}`}
                          state={{
                            service,
                            customerLocation: location,
                          }}
                          className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white transition hover:bg-blue-700"
                        >
                          Profile
                          <FiArrowRight size={14} />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex h-11 cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-400"
                        >
                          Profile
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && searched && sortedServices.length === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FiSearch size={28} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-900">
              No services found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find an available service provider matching your
              search within {radius} km.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const newRadius = Math.min(radius * 2, 200);
                  setRadius(newRadius);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <FiNavigation size={15} />
                Increase Radius
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <FiRefreshCw size={15} />
                Reset Search
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            INITIAL STATE
        ================================================= */}

        {!searched && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiNavigation size={28} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-900">
              Find services around you
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Detect your location, select a service and choose a search radius
              to find trusted local professionals.
            </p>

            <button
              type="button"
              onClick={() => handleGetLocation(true)}
              disabled={locationLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {locationLoading ? (
                <>
                  <FiRefreshCw size={16} className="animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <FiNavigation size={16} />
                  Detect My Location
                </>
              )}
            </button>
          </section>
        )}
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          HelpDesk — Find trusted local services near you.
        </div>
      </footer>
    </div>
  );
};

export default Search;
