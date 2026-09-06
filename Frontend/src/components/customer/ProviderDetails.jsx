import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";


import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiGlobe,
  FiHome,
  FiInfo,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiShield,
  FiStar,
  FiTool,
  FiUser,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import api from "../../services/api";

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "P"
  );
};

const getCoordinates = (provider) => {
  const coordinates = provider?.location?.coordinates;

  if (Array.isArray(coordinates)) {
    return coordinates;
  }

  if (Array.isArray(coordinates?.coordinates)) {
    return coordinates.coordinates;
  }

  return [];
};

const getPriceUnitLabel = (unit) => {
  const units = {
    hour: "Per Hour",
    day: "Per Day",
    visit: "Per Visit",
    service: "Per Service",
    trip: "Per Trip",
    custom: "Custom",
  };

  return units[unit] || unit || "Per Service";
};

const ProviderAvatar = ({ provider, large = false }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [provider?.profileImage]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl ${
        large ? "h-28 w-28 sm:h-36 sm:w-36" : "h-12 w-12"
      }`}
    >
      {provider?.profileImage && !imageError ? (
        <img
          src={provider.profileImage}
          alt={provider.fullName || "Provider"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`font-black ${large ? "text-4xl" : "text-sm"}`}>
          {getInitials(provider?.fullName)}
        </span>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 break-words text-sm font-bold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, description, children }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>

          {description && (
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
};

const ProviderDetails = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProvider = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/provider/${providerId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load provider");
      }

      setProvider(response.data.provider);
    } catch (error) {
      console.error("Provider Details Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load provider profile",
      );

      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  const coordinates = useMemo(() => getCoordinates(provider), [provider]);

  const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2;

  const longitude = hasCoordinates ? coordinates[0] : null;
  const latitude = hasCoordinates ? coordinates[1] : null;

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  const rating = Number(provider?.rating || 0);
  const totalReviews = Number(provider?.totalReviews || 0);

  const roundedRating = Math.min(5, Math.max(0, Math.round(rating)));

  const categoryName =
    typeof provider?.category === "object"
      ? provider.category?.name
      : provider?.category;

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-28 rounded-xl bg-slate-200" />

            <div className="mt-6 h-72 rounded-3xl bg-slate-200" />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="h-72 rounded-2xl bg-white" />
              <div className="h-72 rounded-2xl bg-white" />
              <div className="h-72 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Provider Not Found
  |--------------------------------------------------------------------------
  */

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiX size={26} />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-900">
            Provider Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This provider profile is unavailable or no longer active.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FiArrowLeft size={17} />
            <span>Back</span>
          </button>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
            <FiShield size={14} />
            Local Service Provider
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 shadow-xl">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row">
                <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-1.5 backdrop-blur">
                  <ProviderAvatar provider={provider} large />
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="max-w-full text-2xl font-black text-white sm:text-3xl">
                      {provider.fullName}
                    </h1>

                    {provider.isVerified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-bold text-blue-200 ring-1 ring-blue-400/20">
                        <FiCheckCircle size={13} />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-base font-semibold text-blue-200">
                    {provider.serviceName || "Professional Service Provider"}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {categoryName && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                        <FiBriefcase size={13} />
                        {categoryName}
                      </span>
                    )}

                    {provider.location?.city && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                        <FiMapPin size={13} />
                        {provider.location.city}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        provider.isAvailable
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          provider.isAvailable
                            ? "bg-emerald-400"
                            : "bg-slate-400"
                        }`}
                      />

                      {provider.isAvailable
                        ? "Available"
                        : "Currently Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
                <div className="flex items-center justify-center gap-1.5">
                  <FiStar
                    size={19}
                    className="text-amber-300"
                    fill="currentColor"
                  />

                  <span className="text-2xl font-black text-white">
                    {rating.toFixed(1)}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {totalReviews} review
                  {totalReviews === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
              <div className="p-4 text-center">
                <p className="text-xl font-black text-white">
                  {provider.experience || 0}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Years Experience
                </p>
              </div>

              <div className="border-l border-white/10 p-4 text-center">
                <p className="text-xl font-black text-white">
                  {provider.serviceRadius || 0} km
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Service Radius
                </p>
              </div>

              <div className="border-t border-white/10 p-4 text-center sm:border-l sm:border-t-0">
                <p className="text-xl font-black text-white">{totalReviews}</p>

                <p className="mt-1 text-[11px] text-slate-400">Reviews</p>
              </div>

              <div className="border-l border-t border-white/10 p-4 text-center sm:border-t-0">
                <p className="text-xl font-black text-white">
                  Rs. {Number(provider.basePrice || 0).toLocaleString()}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Starting Price
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Content */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ============================================================ */}
          {/* LEFT */}
          {/* ============================================================ */}

          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <SectionCard
              icon={FiUser}
              title="About Provider"
              description="Professional information"
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {provider.description ||
                  "This provider has not added a professional description yet."}
              </p>
            </SectionCard>

            {/* Professional */}
            <SectionCard
              icon={FiTool}
              title="Professional Information"
              description="Services, category and experience"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem
                  icon={FiBriefcase}
                  label="Category"
                  value={categoryName}
                />

                <InfoItem
                  icon={FiZap}
                  label="Service"
                  value={provider.serviceName}
                />

                <InfoItem
                  icon={FiUsers}
                  label="Experience"
                  value={`${provider.experience || 0} years`}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="Service Radius"
                  value={`${provider.serviceRadius || 0} km`}
                />
              </div>
            </SectionCard>

            {/* Location */}
            <SectionCard
              icon={FiMapPin}
              title="Service Location"
              description="Registered service area"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem
                  icon={FiHome}
                  label="Address"
                  value={provider.location?.address}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="City"
                  value={provider.location?.city}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="District"
                  value={provider.location?.district}
                />

                <InfoItem
                  icon={FiGlobe}
                  label="Province"
                  value={provider.location?.province}
                />

                {hasCoordinates && (
                  <div className="sm:col-span-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Coordinates
                          </p>

                          <p className="mt-1 font-mono text-sm font-bold text-slate-700">
                            {latitude}, {longitude}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            Latitude, Longitude
                          </p>
                        </div>

                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            <FiMapPin size={13} />
                            Map
                            <FiExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ============================================================ */}
          {/* RIGHT */}
          {/* ============================================================ */}

          <div className="space-y-6">
            {/* Pricing */}
            <SectionCard
              icon={FiBriefcase}
              title="Service Price"
              description="Provider's starting price"
            >
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                <p className="text-xs text-slate-400">Base Price</p>

                <p className="mt-1 text-3xl font-black">
                  Rs. {Number(provider.basePrice || 0).toLocaleString()}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                  {getPriceUnitLabel(provider.priceUnit)}
                </span>
              </div>
            </SectionCard>

            {/* Rating */}
            <SectionCard
              icon={FiStar}
              title="Customer Rating"
              description="Based on customer feedback"
            >
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">
                  {rating.toFixed(1)}
                </p>

                <div className="mt-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={18}
                      fill={star <= roundedRating ? "currentColor" : "none"}
                      className={
                        star <= roundedRating
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                    />
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {totalReviews} review
                  {totalReviews === 1 ? "" : "s"}
                </p>
              </div>
            </SectionCard>

            {/* Contact */}
            <SectionCard
              icon={FiPhone}
              title="Contact Provider"
              description="Get in touch with this provider"
            >
              <div className="space-y-3">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FiPhone size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Phone</p>

                      <p className="text-sm font-bold text-slate-700">
                        {provider.phone}
                      </p>
                    </div>
                  </a>
                )}

                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FiMail size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Email</p>

                      <p className="break-all text-sm font-bold text-slate-700">
                        {provider.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Request */}
              <Link
                to={
                  provider.isAvailable
                    ? `/service-request/create/${provider._id}`
                    : "#"
                }
                onClick={(event) => {
                  if (!provider.isAvailable) {
                    event.preventDefault();
                    toast.info("This provider is currently unavailable.");
                  }
                }}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition ${
                  provider.isAvailable
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                <FiMessageCircle size={17} />

                {provider.isAvailable
                  ? "Request This Service"
                  : "Provider Unavailable"}
              </Link>
            </SectionCard>

            {/* Verification */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FiShield size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-blue-900">
                    {provider.isVerified
                      ? "Verified Provider"
                      : "Provider Profile"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    {provider.isVerified
                      ? "This provider has been verified by the platform."
                      : "Review provider information before requesting a service."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDetails;
