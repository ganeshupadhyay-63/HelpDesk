import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTool,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { getServiceById } from "../../services/service.api";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(location.state?.service || null);

  const [customerLocation] = useState(location.state?.customerLocation || null);

  const [loading, setLoading] = useState(!location.state?.service);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchService = async () => {
      if (!id) {
        setError("Service ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getServiceById(id);

        if (!mounted) return;

        if (!data?.success || !data?.service) {
          throw new Error(data?.message || "Unable to load service details.");
        }

        setService(data.service);
      } catch (err) {
        console.error("Service details error:", err);

        if (!mounted) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load service details.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchService();

    return () => {
      mounted = false;
    };
  }, [id]);

  const provider = service?.provider || {};
  const category = service?.category || {};

  const providerName = provider?.fullName || "Local Service Provider";

  const categoryName =
    typeof category === "string"
      ? category
      : category?.name || "Professional Service";

  const serviceName = service?.name || "Service";

  const description =
    service?.description ||
    "Professional local service available in your area.";

  const basePrice = Number(service?.basePrice || 0);

  const priceUnit = service?.priceUnit || "service";

  const isAvailable = service?.isAvailable !== false;

  const isActive = service?.isActive !== false;

  const rating = Number(provider?.rating || 0);

  const totalReviews = Number(provider?.totalReviews || 0);

  const experience =
    provider?.experience || provider?.yearsOfExperience || null;

  const address = provider?.location?.address || "";

  const city = provider?.location?.city || "";

  const district = provider?.location?.district || "";

  const province = provider?.location?.province || "";

  const serviceRadius = Number(provider?.serviceRadius || 0);

  const phone = provider?.phone || "";

  const profileImage = provider?.profileImage || "";

  const serviceImages = useMemo(() => {
    if (!Array.isArray(service?.images)) {
      return [];
    }

    return service.images.filter(Boolean);
  }, [service]);

  const locationText = [address, city, district, province]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates =
    provider?.location?.coordinates &&
    Array.isArray(provider.location.coordinates) &&
    provider.location.coordinates.length === 2;

  const handleRequestService = () => {
    if (!service?._id) {
      toast.error("Service information is unavailable.");
      return;
    }

    if (!isAvailable || !isActive) {
      toast.error("This service is currently unavailable.");
      return;
    }

    navigate(`/request/${service._id}`, {
      state: {
        service,
        customerLocation,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="h-72 animate-pulse bg-slate-200 sm:h-96" />

              <div className="space-y-4 p-6">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-20 animate-pulse rounded bg-slate-200" />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiXCircle size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Load Service
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "The requested service could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FiRefreshCw size={16} />
              Try Again
            </button>

            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Search
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FiTool size={20} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                HelpDesk
              </h1>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Local services, made simple
              </p>
            </div>
          </Link>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Search</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="transition hover:text-blue-600">
            Home
          </Link>

          <span>/</span>

          <Link to="/search" className="transition hover:text-blue-600">
            Search
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-800">{serviceName}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left Content */}
          <section className="space-y-6">
            {/* Service Hero */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-50 via-slate-100 to-slate-200 sm:h-80 lg:h-96">
                {serviceImages.length > 0 ? (
                  <img
                    src={serviceImages[0]}
                    alt={serviceName}
                    className="h-full w-full object-cover"
                  />
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt={providerName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-blue-500 shadow-sm">
                      <FiTool size={44} />
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-5 sm:p-7">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700">
                        <FiBriefcase size={13} />
                        {categoryName}
                      </span>

                      <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                        {serviceName}
                      </h2>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur ${
                        isAvailable && isActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {isAvailable && isActive ? (
                        <>
                          <FiCheckCircle size={14} />
                          Available
                        </>
                      ) : (
                        <>
                          <FiXCircle size={14} />
                          Unavailable
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                      <FiStar size={17} className="fill-current" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {rating.toFixed(1)}
                      </p>

                      <p className="text-xs text-slate-400">
                        {totalReviews}{" "}
                        {totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiMapPin size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {city || district || "Local Area"}
                      </p>

                      <p className="text-xs text-slate-400">Service location</p>
                    </div>
                  </div>

                  {serviceRadius > 0 && (
                    <>
                      <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <FiNavigation size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {serviceRadius} km
                          </p>

                          <p className="text-xs text-slate-400">
                            Service radius
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="my-6 h-px bg-slate-100" />

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    About this service
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Information */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUser size={19} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Service Provider
                  </h3>

                  <p className="text-xs text-slate-400">
                    Professional service provider
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={providerName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser size={32} className="text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xl font-extrabold text-slate-900">
                      {providerName}
                    </h4>

                    {provider?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                        <FiCheckCircle size={12} />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    {experience && (
                      <span className="inline-flex items-center gap-1.5">
                        <FiBriefcase size={15} />
                        {experience} experience
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5">
                      <FiStar size={15} className="text-amber-500" />
                      {rating.toFixed(1)} rating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiMapPin size={19} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Service Location
                  </h3>

                  <p className="text-xs text-slate-400">
                    Provider's registered service area
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <FiMapPin size={18} className="mt-1 shrink-0 text-blue-600" />

                  <span>
                    {locationText || "Location information not available."}
                  </span>
                </p>
              </div>

              {hasCoordinates && (
                <p className="mt-3 text-xs text-slate-400">
                  This provider offers service within approximately{" "}
                  <span className="font-semibold text-slate-600">
                    {serviceRadius || 0} km
                  </span>{" "}
                  of their service location.
                </p>
              )}
            </div>
          </section>

          {/* Right Booking Card */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Price */}
              <div className="border-b border-slate-100 p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Starting Price
                </p>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    Rs. {basePrice.toLocaleString()}
                  </span>

                  <span className="text-sm font-medium text-slate-400">
                    / {priceUnit}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Final amount may vary based on distance and service
                  requirements.
                </p>
              </div>

              {/* Provider mini profile */}
              <div className="border-b border-slate-100 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={providerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser size={22} className="text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {providerName}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <FiStar
                        size={13}
                        className="fill-current text-amber-500"
                      />
                      {rating.toFixed(1)}
                      <span>•</span>
                      {totalReviews} reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 sm:p-7">
                <button
                  type="button"
                  onClick={handleRequestService}
                  disabled={!isAvailable || !isActive}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-sm transition ${
                    isAvailable && isActive
                      ? "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  {isAvailable && isActive ? (
                    <>
                      Request Service
                      <FiArrowRight size={17} />
                    </>
                  ) : (
                    <>
                      Service Unavailable
                      <FiXCircle size={17} />
                    </>
                  )}
                </button>

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FiPhone size={16} />
                    Contact Provider
                  </a>
                )}

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                  <FiShield
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Safe & Direct
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                      Your request goes directly to the service provider.
                    </p>
                  </div>
                </div>

                {customerLocation && (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
                    <FiNavigation
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-blue-800">
                        Your Location Detected
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-blue-700">
                        Your location will be used to calculate the applicable
                        travel charge.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Summary */}
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Service Summary
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">Category</span>

                  <span className="text-right text-xs font-semibold text-slate-800">
                    {categoryName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">Price</span>

                  <span className="text-right text-xs font-semibold text-slate-800">
                    Rs. {basePrice.toLocaleString()} / {priceUnit}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">Availability</span>

                  <span
                    className={`text-xs font-bold ${
                      isAvailable && isActive
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {isAvailable && isActive ? "Available" : "Unavailable"}
                  </span>
                </div>

                {serviceRadius > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Service Radius
                    </span>

                    <span className="text-xs font-semibold text-slate-800">
                      {serviceRadius} km
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">Rating</span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
                    <FiStar size={13} className="fill-current text-amber-500" />
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetails;
