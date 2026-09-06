import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";

import {
  getActiveCategories,
} from "../../services/category.api";

import {
  registerProvider,
} from "../../services/auth.api";

import { useAuth } from "../../context/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
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
  serviceRadius: "10",
  basePrice: "",
  priceUnit: "service",
};

const ProviderRegister = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [formData, setFormData] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/provider/dashboard", {
        replace: true,
      });
    }
  }, [
    authLoading,
    isAuthenticated,
    navigate,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data =
          await getActiveCategories();

        if (data?.success) {
          setCategories(
            data.categories || []
          );
        }
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );

        toast.error(
          "Unable to load service categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    toast.info(
      "Requesting your current location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude:
            position.coords.latitude.toString(),
          longitude:
            position.coords.longitude.toString(),
        }));

        toast.success(
          "Current location captured successfully."
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        toast.error(
          "Unable to get your location. Please enter coordinates manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const validateForm = () => {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      category,
      serviceName,
      address,
      city,
      latitude,
      longitude,
      serviceRadius,
      basePrice,
    } = formData;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      return "Please complete your basic information.";
    }

    if (!category) {
      return "Please select a service category.";
    }

    if (!serviceName.trim()) {
      return "Please enter your service name.";
    }

    if (!address.trim() || !city.trim()) {
      return "Please enter your service location.";
    }

    if (!latitude || !longitude) {
      return "Please provide your location coordinates.";
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      return "Latitude must be between -90 and 90.";
    }

    if (
      Number.isNaN(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      return "Longitude must be between -180 and 180.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (
      !serviceRadius ||
      Number(serviceRadius) < 1
    ) {
      return "Service radius must be at least 1 km.";
    }

    if (
      basePrice === "" ||
      Number(basePrice) < 0
    ) {
      return "Please enter a valid base price.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email
          .trim()
          .toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,

        category: formData.category,

        serviceName:
          formData.serviceName.trim(),

        description:
          formData.description.trim(),

        experience:
          formData.experience === ""
            ? 0
            : Number(formData.experience),

        location: {
          address:
            formData.address.trim(),

          city: formData.city.trim(),

          district:
            formData.district.trim(),

          province:
            formData.province.trim(),

          coordinates: {
            type: "Point",
            coordinates: [
              Number(formData.longitude),
              Number(formData.latitude),
            ],
          },
        },

        serviceRadius:
          Number(formData.serviceRadius),

        basePrice:
          Number(formData.basePrice),

        priceUnit: formData.priceUnit,
      };

      const data =
        await registerProvider(payload);

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Registration failed."
        );
      }

      toast.success(
        "Provider account created successfully!"
      );

      /*
       * If backend returns token, store it and
       * directly enter dashboard.
       *
       * Otherwise send provider to login.
       */
      if (data.token) {
        localStorage.setItem(
          "providerToken",
          data.token
        );

        navigate(
          "/provider/dashboard",
          {
            replace: true,
          }
        );
      } else {
        navigate("/provider/login", {
          replace: true,
          state: {
            registered: true,
          },
        });
      }
    } catch (error) {
      console.error(
        "Provider registration error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create provider account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FiSearch size={20} />
            </div>

            <span className="text-xl font-bold text-slate-900">
              Help<span className="text-blue-600">
                Desk
              </span>
            </span>
          </Link>

          <Link
            to="/provider/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Already a provider?
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <FiArrowLeft size={15} />
            Back to HelpDesk
          </Link>

          <p className="mt-7 text-sm font-bold uppercase tracking-wider text-blue-600">
            Become a provider
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create your provider account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Tell customers about your services and help them
            find you when they need local professionals.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Basic Information */}
          <section className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiUser size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Basic information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your contact information will be used to
                  communicate with customers.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              <InputField
                label="Full name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                icon={<FiUser />}
                required
              />

              <InputField
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<FiMail />}
                required
              />

              <InputField
                label="Phone number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
                icon={<FiPhone />}
                required
              />

              <InputField
                label="Years of experience"
                name="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5"
                icon={<FiClock />}
              />

              {/* Password */}
              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                show={showPassword}
                setShow={setShowPassword}
                placeholder="Minimum 6 characters"
              />

              <PasswordField
                label="Confirm password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                placeholder="Re-enter your password"
              />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Service Information */}
          <section className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiBriefcase size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Service information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell customers what kind of service you provide.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loadingCategories}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                </div>
              </div>

              <InputField
                label="Service name"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                placeholder="e.g. Electrical Repair"
                icon={<FiBriefcase />}
                required
              />

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Service description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe the services you provide..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {formData.description.length}/1000
                </p>
              </div>

              <InputField
                label="Base price"
                name="basePrice"
                type="number"
                min="0"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="e.g. 600"
                icon={<span className="text-xs font-bold">Rs.</span>}
                required
              />

              <div>
                <label
                  htmlFor="priceUnit"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Price unit
                </label>

                <div className="relative">
                  <select
                    id="priceUnit"
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleChange}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="service">
                      Per service
                    </option>

                    <option value="visit">
                      Per visit
                    </option>

                    <option value="hour">
                      Per hour
                    </option>

                    <option value="day">
                      Per day
                    </option>

                    <option value="trip">
                      Per trip
                    </option>

                    <option value="custom">
                      Custom
                    </option>
                  </select>

                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                </div>
              </div>

              <InputField
                label="Service radius (km)"
                name="serviceRadius"
                type="number"
                min="1"
                value={formData.serviceRadius}
                onChange={handleChange}
                placeholder="e.g. 20"
                icon={<FiMapPin />}
                required
              />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Location */}
          <section className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <FiMapPin size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Service location
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your location helps customers find nearby
                    services.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleUseCurrentLocation
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                <FiMapPin size={15} />
                Use my location
              </button>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              <InputField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Mahendranagar-4"
                icon={<FiHome />}
                required
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mahendranagar"
                icon={<FiMapPin />}
                required
              />

              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Kanchanpur"
              />

              <InputField
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="e.g. Sudurpashchim"
              />

              <InputField
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 28.9639"
                required
              />

              <InputField
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 80.1815"
                required
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                <strong className="text-slate-700">
                  Location tip:
                </strong>{" "}
                You can use the location button above to
                automatically capture your current latitude and
                longitude.
              </p>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Submit */}
          <section className="bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiCheck className="text-emerald-500" />
                  Ready to join HelpDesk?
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  You can update your profile and services later.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 min-w-48 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  "Create provider account"
                )}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
};

/* -----------------------------
   Reusable input
----------------------------- */

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            icon ? "pl-11" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

/* -----------------------------
   Password input
----------------------------- */

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  show,
  setShow,
  placeholder,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <div className="relative">
        <FiLock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />

        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={() =>
            setShow((prev) => !prev)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ProviderRegister;