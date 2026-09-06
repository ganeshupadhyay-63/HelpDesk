import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiArrowLeft,
  FiBriefcase,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiEdit3,
  FiExternalLink,
  FiGlobe,
  FiHome,
  FiInfo,
  FiKey,
  FiLock,
  FiMail,
  FiMapPin,
   FiPhone,
  FiSave,
  FiShield,
  FiStar,
  FiTool,
  FiUser,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../services/api";
import { getActiveCategories } from "../../services/category.api";

const PRICE_UNITS = [
  { value: "hour", label: "Per Hour" },
  { value: "day", label: "Per Day" },
  { value: "visit", label: "Per Visit" },
  { value: "service", label: "Per Service" },
  { value: "trip", label: "Per Trip" },
  { value: "custom", label: "Custom" },
];

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  profileImage: "",
  category: "",
  serviceName: "",
  description: "",
  experience: "",
  address: "",
  city: "",
  district: "",
  province: "",
  latitude: "",
  longitude: "",
  serviceRadius: "",
  basePrice: "",
  priceUnit: "visit",
};

const EMPTY_PASSWORD = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const MAX_DESCRIPTION_LENGTH = 1000;

const getInitials = (name = "") => {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "P"
  );
};

const normalizeProvider = (provider) => {
  if (!provider) {
    return { ...EMPTY_FORM };
  }

  const coordinates =
    provider?.location?.coordinates?.coordinates &&
    Array.isArray(provider.location.coordinates.coordinates)
      ? provider.location.coordinates.coordinates
      : [];

  return {
    fullName: provider?.fullName || "",
    phone: provider?.phone || "",
    profileImage: provider?.profileImage || "",

    category:
      typeof provider?.category === "object"
        ? provider.category?._id || ""
        : provider?.category || "",

    serviceName: provider?.serviceName || "",
    description: provider?.description || "",

    experience:
      provider?.experience !== undefined && provider?.experience !== null
        ? String(provider.experience)
        : "",

    address: provider?.location?.address || "",
    city: provider?.location?.city || "",
    district: provider?.location?.district || "",
    province: provider?.location?.province || "",

    longitude:
      coordinates.length === 2 && coordinates[0] !== undefined
        ? String(coordinates[0])
        : "",

    latitude:
      coordinates.length === 2 && coordinates[1] !== undefined
        ? String(coordinates[1])
        : "",

    serviceRadius:
      provider?.serviceRadius !== undefined && provider?.serviceRadius !== null
        ? String(provider.serviceRadius)
        : "",

    basePrice:
      provider?.basePrice !== undefined && provider?.basePrice !== null
        ? String(provider.basePrice)
        : "",

    priceUnit: provider?.priceUnit || "visit",
  };
};

const getCategoryName = (category) => {
  if (!category) return "Not selected";

  if (typeof category === "object") {
    return category?.name || "Not selected";
  }

  return String(category);
};

const getPriceUnitLabel = (unit) => {
  return (
    PRICE_UNITS.find((item) => item.value === unit)?.label ||
    unit ||
    "Not specified"
  );
};

const ProviderAvatar = ({ provider, large = false }) => {
  const [imageError, setImageError] = useState(false);

  const image = provider?.profileImage;

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl ${
        large ? "h-28 w-28 sm:h-32 sm:w-32" : "h-12 w-12"
      }`}
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={provider?.fullName || "Provider"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`font-black ${large ? "text-3xl" : "text-sm"}`}>
          {getInitials(provider?.fullName)}
        </span>
      )}
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, description, children, action }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>

            {description && (
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  disabled = false,
  required = false,
  min,
  step,
  max,
  autoComplete,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  name,
  options,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? "pl-10" : ""
          }`}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <FiChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

const TextAreaField = ({
  label,
  value,
  onChange,
  name,
  placeholder,
  required = false,
}) => {
  const count = value?.length || 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <span
          className={`text-[11px] font-medium ${
            count > MAX_DESCRIPTION_LENGTH * 0.9
              ? "text-amber-600"
              : "text-slate-400"
          }`}
        >
          {count}/{MAX_DESCRIPTION_LENGTH}
        </span>
      </div>

      <textarea
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={MAX_DESCRIPTION_LENGTH}
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, children }) => {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        {children || (
          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value || "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
};

const ProgressBar = ({ value }) => {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
        }}
      />
    </div>
  );
};

const ProviderProfile = () => {
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [changingPassword, setChangingPassword] = useState(false);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Location detection state
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/provider/me");

      if (!response.data?.success || !response.data?.provider) {
        throw new Error(response.data?.message || "Provider profile not found");
      }

      const providerData = response.data.provider;

      setProvider(providerData);
      setForm(normalizeProvider(providerData));
    } catch (error) {
      console.error("Provider profile error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/provider/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);

      const response = await getActiveCategories();

      if (response?.success) {
        setCategories(response.categories || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Category loading error:", error);

      setCategories([]);
      toast.error("Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [fetchProfile, fetchCategories]);

  const selectedCategory = useMemo(() => {
    if (!form.category) return null;

    return categories.find(
      (category) => String(category._id) === String(form.category),
    );
  }, [categories, form.category]);

  const profileCompletion = useMemo(() => {
    if (!provider) return 0;

    const checks = [
      Boolean(provider.fullName),
      Boolean(provider.phone),
      Boolean(provider.profileImage),
      Boolean(provider.category),
      Boolean(provider.serviceName),
      Boolean(provider.description),
      provider.experience !== undefined && provider.experience !== null,
      Boolean(provider.location?.address),
      Boolean(provider.location?.city),
      Boolean(provider.location?.district),
      Boolean(provider.location?.province),
      Boolean(
        provider.location?.coordinates?.coordinates &&
        Array.isArray(provider.location.coordinates.coordinates) &&
        provider.location.coordinates.coordinates.length === 2,
      ),
      Boolean(provider.serviceRadius),
      provider.basePrice !== undefined && provider.basePrice !== null,
      Boolean(provider.priceUnit),
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [provider]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | DETECT CURRENT LOCATION
  |--------------------------------------------------------------------------
  | Browser GPS location is used.
  | The result is stored in:
  | form.latitude
  | form.longitude
  |--------------------------------------------------------------------------
  */
  const handleDetectLocation = () => {
    if (locationLoading) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          toast.error("Invalid location coordinates received.");
          setLocationLoading(false);
          return;
        }

        setForm((previous) => ({
          ...previous,
          latitude: String(latitude),
          longitude: String(longitude),
        }));

        toast.success("Your current location has been detected.");

        setLocationLoading(false);
      },
      (error) => {
        console.error("Location detection error:", error);

        let message = "Unable to detect your current location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission denied. Please allow location access and try again.";
            break;

          case error.POSITION_UNAVAILABLE:
            message = "Your current location is unavailable. Please try again.";
            break;

          case error.TIMEOUT:
            message = "Location detection timed out. Please try again.";
            break;

          default:
            message =
              "Unable to detect your current location. Please try again.";
        }

        toast.error(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  };

  const validateForm = () => {
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (!fullName) {
      toast.error("Full name is required");
      return false;
    }

    if (!phone) {
      toast.error("Phone number is required");
      return false;
    }

    if (!/^\d{7,15}$/.test(phone)) {
      toast.error("Enter a valid phone number");
      return false;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return false;
    }

    if (!form.serviceName.trim()) {
      toast.error("Service name is required");
      return false;
    }

    if (!form.address.trim() || !form.city.trim()) {
      toast.error("Address and city are required");
      return false;
    }

    if (form.description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      );
      return false;
    }

    if (form.experience !== "") {
      const experience = Number(form.experience);

      if (!Number.isFinite(experience) || experience < 0) {
        toast.error("Experience must be a valid number");
        return false;
      }
    }

    if (
      !form.serviceRadius ||
      !Number.isFinite(Number(form.serviceRadius)) ||
      Number(form.serviceRadius) < 1
    ) {
      toast.error("Service radius must be at least 1 km");
      return false;
    }

    if (
      form.basePrice === "" ||
      !Number.isFinite(Number(form.basePrice)) ||
      Number(form.basePrice) < 0
    ) {
      toast.error("Base price must be a valid amount");
      return false;
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Latitude must be between -90 and 90");
      return false;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Longitude must be between -180 and 180");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        profileImage: form.profileImage.trim(),
        category: form.category,
        serviceName: form.serviceName.trim(),
        description: form.description.trim(),

        experience: form.experience === "" ? 0 : Number(form.experience),

        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          province: form.province.trim(),

          coordinates: {
            type: "Point",

            // IMPORTANT:
            // GeoJSON requires [longitude, latitude]
            coordinates: [Number(form.longitude), Number(form.latitude)],
          },
        },

        serviceRadius: Number(form.serviceRadius),
        basePrice: Number(form.basePrice),
        priceUnit: form.priceUnit,
      };

      const response = await api.put("/provider/me", payload);

      if (!response.data?.success || !response.data?.provider) {
        throw new Error(response.data?.message || "Failed to update profile");
      }

      const updatedProvider = response.data.provider;

      setProvider(updatedProvider);
      setForm(normalizeProvider(updatedProvider));
      setEditMode(false);

      toast.success(response.data.message || "Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/provider/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (provider) {
      setForm(normalizeProvider(provider));
    }

    setEditMode(false);
    setLocationLoading(false);
  };

  const handleAvailabilityToggle = async () => {
    if (!provider || availabilityLoading) return;

    try {
      setAvailabilityLoading(true);

      const nextValue = !Boolean(provider.isAvailable);

      const response = await api.put("/provider/availability", {
        isAvailable: nextValue,
      });

      if (!response.data?.success || !response.data?.provider) {
        throw new Error(
          response.data?.message || "Failed to update availability",
        );
      }

      const updatedProvider = response.data.provider;

      setProvider(updatedProvider);
      setForm(normalizeProvider(updatedProvider));

      toast.success(
        response.data.message ||
          (nextValue ? "You are now available" : "You are now unavailable"),
      );
    } catch (error) {
      console.error("Availability error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/provider/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update availability",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (changingPassword) return;

    if (!passwordForm.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("Enter your new password");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put("/provider/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to change password");
      }

      toast.success(response.data.message || "Password changed successfully");

      setPasswordForm(EMPTY_PASSWORD);
      setPasswordOpen(false);
    } catch (error) {
      console.error("Change password error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/provider/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    if (changingPassword) return;

    setPasswordForm(EMPTY_PASSWORD);
    setPasswordOpen(false);
  };

  const coordinates = Array.isArray(
    provider?.location?.coordinates?.coordinates,
  )
    ? provider.location.coordinates.coordinates
    : [];

  const hasCoordinates = coordinates.length === 2;

  const latitude = hasCoordinates ? coordinates[1] : null;
  const longitude = hasCoordinates ? coordinates[0] : null;

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  const categoryName =
    selectedCategory?.name || getCategoryName(provider?.category);

  const rating = Number(provider?.rating || 0);

  const roundedRating = Math.min(5, Math.max(0, Math.round(rating)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-48 rounded-xl bg-slate-200" />

            <div className="mt-6 overflow-hidden rounded-3xl bg-white">
              <div className="h-72 bg-slate-200" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="h-80 rounded-2xl bg-white" />
              <div className="h-80 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiInfo size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Load Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We couldn't load your provider profile. Please try again.
          </p>

          <button
            type="button"
            onClick={fetchProfile}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Try Again
          </button>

          <Link
            to="/provider/dashboard"
            className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <FiArrowLeft size={15} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/provider/dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <FiArrowLeft size={18} />
            </Link>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                My Profile
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your professional provider profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <FiEdit3 size={16} />

                <span className="hidden sm:inline">Edit Profile</span>

                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <FiX size={16} />

                  <span className="hidden sm:inline">Cancel</span>
                </button>

                <button
                  type="submit"
                  form="provider-profile-form"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FiSave size={16} />
                  )}

                  <span className="hidden sm:inline">
                    {saving ? "Saving..." : "Save Changes"}
                  </span>

                  <span className="sm:hidden">Save</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 shadow-xl">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative mx-auto sm:mx-0">
                  <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-1.5 backdrop-blur">
                    <ProviderAvatar provider={provider} large />
                  </div>

                  {provider.isVerified && (
                    <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-950 bg-blue-500 text-white shadow-lg">
                      <FiCheck size={16} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="max-w-full truncate text-xl font-black text-white sm:text-2xl">
                      {provider.fullName || "Provider"}
                    </h2>

                    {provider.isVerified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-bold text-blue-200">
                        <FiCheckCircle size={12} />
                        Verified Provider
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-semibold text-blue-200">
                    {provider.serviceName || "Professional Service Provider"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {provider.email && (
                      <a
                        href={`mailto:${provider.email}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <FiMail size={13} />

                        <span className="truncate">{provider.email}</span>
                      </a>
                    )}

                    {provider.phone && (
                      <a
                        href={`tel:${provider.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <FiPhone size={13} />
                        {provider.phone}
                      </a>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-200">
                      <FiBriefcase size={12} />
                      {categoryName}
                    </span>

                    {provider.location?.city && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-200">
                        <FiMapPin size={12} />
                        {provider.location.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col lg:items-end">
                <div
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                    provider.isAvailable
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      provider.isAvailable ? "bg-emerald-400" : "bg-slate-400"
                    }`}
                  />

                  {provider.isAvailable
                    ? "Available for Work"
                    : "Currently Unavailable"}
                </div>

                <button
                  type="button"
                  onClick={handleAvailabilityToggle}
                  disabled={availabilityLoading}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:opacity-60 ${
                    provider.isAvailable
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {availabilityLoading
                    ? "Updating..."
                    : provider.isAvailable
                      ? "Set Unavailable"
                      : "Set Available"}
                </button>
              </div>
            </div>

            {/* COMPLETION */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-300" size={16} />

                    <p className="text-sm font-bold text-white">
                      Profile Completeness
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Keep your profile complete to help customers understand your
                    services.
                  </p>
                </div>

                <span className="text-lg font-black text-white">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-700"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white">
                  <FiStar className="text-amber-300" size={16} />

                  <span className="text-lg font-bold">{rating.toFixed(1)}</span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">Rating</p>
              </div>

              <div className="border-l border-white/10 p-4 text-center">
                <p className="text-lg font-bold text-white">
                  {provider.totalReviews || 0}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">Reviews</p>
              </div>

              <div className="border-t border-white/10 p-4 text-center sm:border-l sm:border-t-0">
                <p className="text-lg font-bold text-white">
                  {provider.experience || 0}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Years Experience
                </p>
              </div>

              <div className="border-l border-t border-white/10 p-4 text-center sm:border-t-0">
                <p className="text-lg font-bold text-white">
                  {provider.serviceRadius || 0} km
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Service Radius
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EDIT MODE */}
        {editMode ? (
          <form
            id="provider-profile-form"
            onSubmit={handleSaveProfile}
            className="mt-6 space-y-6"
          >
            {/* PERSONAL INFORMATION */}
            <SectionCard
              icon={FiUser}
              title="Personal Information"
              description="Update your basic contact and profile information."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={FiUser}
                  required
                  autoComplete="name"
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  icon={FiPhone}
                  required
                  autoComplete="tel"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Email Address"
                    name="email"
                    value={provider.email || ""}
                    disabled
                    icon={FiMail}
                    autoComplete="email"
                  />

                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                    <FiLock size={11} />
                    Email cannot be changed from the provider profile.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Profile Image URL"
                    name="profileImage"
                    value={form.profileImage}
                    onChange={handleChange}
                    placeholder="https://example.com/profile-image.jpg"
                    icon={FiCamera}
                  />

                  {form.profileImage && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <ProviderAvatar
                        provider={{
                          ...provider,
                          profileImage: form.profileImage,
                        }}
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700">
                          Profile preview
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          Image will be shown on your provider profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* PROFESSIONAL INFORMATION */}
            <SectionCard
              icon={FiTool}
              title="Professional Information"
              description="Tell customers about your services, category and experience."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Service Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder={
                    categoryLoading
                      ? "Loading categories..."
                      : "Select category"
                  }
                  options={categories.map((category) => ({
                    value: category._id,
                    label: category.name,
                  }))}
                  icon={FiBriefcase}
                  required
                  disabled={categoryLoading}
                />

                <InputField
                  label="Service Name"
                  name="serviceName"
                  value={form.serviceName}
                  onChange={handleChange}
                  placeholder="e.g. Electrical Repair & Installation"
                  icon={FiZap}
                  required
                />

                <InputField
                  label="Experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  type="number"
                  min="0"
                  step="0.5"
                  icon={FiUsers}
                />

                <InputField
                  label="Service Radius"
                  name="serviceRadius"
                  value={form.serviceRadius}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  type="number"
                  min="1"
                  step="0.1"
                  icon={FiMapPin}
                  required
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Professional Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your skills, services, experience and what customers can expect..."
                  />
                </div>
              </div>
            </SectionCard>

            {/* SERVICE LOCATION */}
            <SectionCard
              icon={FiMapPin}
              title="Service Location"
              description="Your location is used for nearby service discovery."
            >
              <div className="space-y-5">
                {/* DETECT LOCATION */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <FiMapPin size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-blue-950">
                          Detect Your Current Location
                        </h3>

                        <p className="mt-1 max-w-xl text-xs leading-5 text-blue-700">
                          Use your device GPS to automatically fill your
                          latitude and longitude. This helps customers find your
                          services nearby.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locationLoading || saving}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <FiMapPin size={16} />
                      )}

                      {locationLoading
                        ? "Detecting Location..."
                        : "Detect My Location"}
                    </button>
                  </div>

                  {/* LOCATION STATUS */}
                  {form.latitude && form.longitude && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                      <FiCheckCircle
                        size={16}
                        className="shrink-0 text-emerald-600"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-800">
                          Location coordinates detected
                        </p>

                        <p className="mt-0.5 break-all font-mono text-[11px] text-emerald-700">
                          {form.latitude}, {form.longitude}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ADDRESS FIELDS */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <InputField
                      label="Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      icon={FiHome}
                      required
                    />
                  </div>

                  <InputField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    icon={FiMapPin}
                    required
                  />

                  <InputField
                    label="District"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    icon={FiMapPin}
                  />

                  <InputField
                    label="Province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    placeholder="Enter province"
                    icon={FiGlobe}
                  />

                  <div className="hidden md:block" />

                  {/* LATITUDE */}
                  <InputField
                    label="Latitude"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 28.9639"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    icon={FiGlobe}
                    required
                  />

                  {/* LONGITUDE */}
                  <InputField
                    label="Longitude"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 80.1815"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    icon={FiGlobe}
                    required
                  />
                </div>

                {/* LOCATION INFORMATION */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <FiInfo
                      className="mt-0.5 shrink-0 text-blue-600"
                      size={17}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        Location information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        GPS automatically fills your latitude and longitude. You
                        can also manually edit the coordinates if required.
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                          Latitude: {form.latitude || "Not detected"}
                        </span>

                        <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                          Longitude: {form.longitude || "Not detected"}
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
                        <p className="text-[11px] leading-5 text-blue-700">
                          <span className="font-bold">Database format:</span>{" "}
                          [longitude, latitude]
                        </p>

                        <p className="mt-0.5 break-all font-mono text-[11px] font-semibold text-blue-800">
                          [{form.longitude || "longitude"},{" "}
                          {form.latitude || "latitude"}]
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* PRICING */}
            <SectionCard
              icon={FiBriefcase}
              title="Pricing"
              description="Set your default service price and billing unit."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Base Price"
                  name="basePrice"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="Enter base price"
                  type="number"
                  min="0"
                  step="0.01"
                  icon={FiZap}
                  required
                />

                <SelectField
                  label="Price Unit"
                  name="priceUnit"
                  value={form.priceUnit}
                  onChange={handleChange}
                  placeholder="Select price unit"
                  options={PRICE_UNITS}
                  icon={FiBriefcase}
                  required
                />
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Pricing Preview
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  Rs. {Number(form.basePrice || 0).toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    / {getPriceUnitLabel(form.priceUnit)}
                  </span>
                </p>
              </div>
            </SectionCard>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* PERSONAL */}
              <SectionCard
                icon={FiUser}
                title="Personal Information"
                description="Your account and contact information."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={FiUser}
                    label="Full Name"
                    value={provider.fullName}
                  />

                  <InfoItem icon={FiMail} label="Email Address">
                    {provider.email ? (
                      <a
                        href={`mailto:${provider.email}`}
                        className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span className="break-all">{provider.email}</span>

                        <FiExternalLink size={13} className="shrink-0" />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Not provided
                      </p>
                    )}
                  </InfoItem>

                  <InfoItem icon={FiPhone} label="Phone Number">
                    {provider.phone ? (
                      <a
                        href={`tel:${provider.phone}`}
                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {provider.phone}
                        <FiExternalLink size={13} />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Not provided
                      </p>
                    )}
                  </InfoItem>

                  <InfoItem icon={FiShield} label="Account Status">
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          provider.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            provider.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />

                        {provider.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </InfoItem>
                </div>
              </SectionCard>

              {/* PROFESSIONAL */}
              <SectionCard
                icon={FiBriefcase}
                title="Professional Information"
                description="Information customers see when discovering your services."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={FiBriefcase}
                    label="Category"
                    value={categoryName}
                  />

                  <InfoItem
                    icon={FiTool}
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

                  <div className="sm:col-span-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-400">
                          Professional Description
                        </p>

                        {provider.description && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {provider.description.length} characters
                          </span>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {provider.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* LOCATION */}
              <SectionCard
                icon={FiMapPin}
                title="Service Location"
                description="Your registered service area and coordinates."
                action={
                  mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                    >
                      <FiMapPin size={13} />
                      Open Map
                      <FiExternalLink size={12} />
                    </a>
                  ) : null
                }
              >
                <div className="grid gap-5 sm:grid-cols-2">
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

                  <InfoItem icon={FiGlobe} label="Coordinates">
                    {hasCoordinates ? (
                      <div className="mt-1">
                        <p className="font-mono text-sm font-bold text-slate-700">
                          {latitude}, {longitude}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Latitude, Longitude
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Not provided
                      </p>
                    )}
                  </InfoItem>

                  <InfoItem icon={FiMapPin} label="Service Area">
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        <FiMapPin size={12} />
                        {provider.serviceRadius || 0} km radius
                      </span>
                    </div>
                  </InfoItem>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              {/* PRICING */}
              <SectionCard
                icon={FiBriefcase}
                title="Pricing"
                description="Your default service pricing."
              >
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                  <p className="text-xs font-medium text-slate-400">
                    Base Price
                  </p>

                  <div className="mt-2">
                    <span className="text-3xl font-black">
                      Rs. {Number(provider.basePrice || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {getPriceUnitLabel(provider.priceUnit)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[11px] font-medium text-slate-400">
                      Amount
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      Rs. {Number(provider.basePrice || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[11px] font-medium text-slate-400">
                      Unit
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {getPriceUnitLabel(provider.priceUnit)}
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* RATING */}
              <SectionCard
                icon={FiStar}
                title="Reviews & Rating"
                description="Your current customer feedback."
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl font-black text-amber-600">
                    {rating.toFixed(1)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={15}
                          fill={star <= roundedRating ? "currentColor" : "none"}
                          strokeWidth={1.8}
                          className={
                            star <= roundedRating
                              ? "text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Based on {provider.totalReviews || 0} review
                      {provider.totalReviews === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-400">
                      Rating score
                    </span>

                    <span className="font-bold text-slate-600">
                      {rating.toFixed(1)} / 5
                    </span>
                  </div>

                  <ProgressBar value={(rating / 5) * 100} />
                </div>
              </SectionCard>

              {/* SECURITY */}
              <SectionCard
                icon={FiLock}
                title="Security"
                description="Keep your provider account secure."
              >
                <button
                  type="button"
                  onClick={() => setPasswordOpen(true)}
                  className="group flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                      <FiKey size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Change Password
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Update your login password
                      </p>
                    </div>
                  </div>

                  <FiArrowLeft
                    size={17}
                    className="rotate-180 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                  />
                </button>
              </SectionCard>

              {/* TIP */}
              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <FiInfo size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Keep your profile updated
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Accurate service information, pricing and location help
                      customers find and contact you more easily.
                    </p>

                    {!provider.isVerified && (
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        <FiShield size={12} />
                        Verification pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSWORD MODAL */}
        {passwordOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !changingPassword) {
                closePasswordModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-password-title"
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiLock size={18} />
                  </div>

                  <div>
                    <h2
                      id="change-password-title"
                      className="text-base font-bold text-slate-900"
                    >
                      Change Password
                    </h2>

                    <p className="text-xs text-slate-500">
                      Secure your provider account
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="space-y-5 p-5 sm:p-6"
              >
                <InputField
                  label="Current Password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="Enter current password"
                  icon={FiLock}
                  required
                  autoComplete="current-password"
                />

                <InputField
                  label="New Password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="At least 6 characters"
                  icon={FiKey}
                  required
                  autoComplete="new-password"
                />

                <InputField
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="Re-enter new password"
                  icon={FiCheck}
                  required
                  autoComplete="new-password"
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700">
                    Password requirements
                  </p>

                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCheck
                        size={13}
                        className={
                          passwordForm.newPassword.length >= 6
                            ? "text-emerald-500"
                            : "text-slate-300"
                        }
                      />
                      At least 6 characters
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCheck
                        size={13}
                        className={
                          passwordForm.newPassword &&
                          passwordForm.newPassword !==
                            passwordForm.currentPassword
                            ? "text-emerald-500"
                            : "text-slate-300"
                        }
                      />
                      Different from current password
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCheck
                        size={13}
                        className={
                          passwordForm.newPassword &&
                          passwordForm.newPassword ===
                            passwordForm.confirmPassword
                            ? "text-emerald-500"
                            : "text-slate-300"
                        }
                      />
                      Passwords match
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={changingPassword}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {changingPassword ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FiKey size={16} />
                    )}

                    {changingPassword ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderProfile;
