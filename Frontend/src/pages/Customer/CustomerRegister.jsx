import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";
import { registerCustomer } from "../../services/customer.api";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  district: "",
  province: "",
  latitude: "",
  longitude: "",
};

const CustomerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // ==================================================
  // Handle Input
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // Detect Current Location
  // ==================================================

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setLocationLoading(false);

        toast.success("Current location detected successfully");
      },
      (error) => {
        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission was denied");
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable");
            break;

          case error.TIMEOUT:
            toast.error("Location request timed out");
            break;

          default:
            toast.error("Unable to detect your location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // ==================================================
  // Validation
  // ==================================================

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error("Please detect your location");
      return false;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast.error("Invalid location coordinates");
      return false;
    }

    if (latitude < -90 || latitude > 90) {
      toast.error("Invalid latitude");
      return false;
    }

    if (longitude < -180 || longitude > 180) {
      toast.error("Invalid longitude");
      return false;
    }

    return true;
  };

  // ==================================================
  // Submit
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        phone: formData.phone.trim(),

        password: formData.password,

        location: {
          address: formData.address.trim(),

          city: formData.city.trim(),

          district: formData.district.trim(),

          province: formData.province.trim(),

          coordinates: {
            type: "Point",

            coordinates: [
              Number(formData.longitude),
              Number(formData.latitude),
            ],
          },
        },
      };

      const response = await registerCustomer(payload);

      if (response?.success) {
        localStorage.setItem("customerToken", response.token);

        if (response.customer) {
          localStorage.setItem(
            "customerUser",
            JSON.stringify(response.customer),
          );
        }

        toast.success("Customer account created successfully");

        navigate("/customer/dashboard");
      }
    } catch (error) {
      console.error("Customer Registration Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to create customer account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            <FiArrowLeft />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create Customer Account
          </h1>

          <p className="mt-2 text-slate-600">
            Create your account and find trusted local service providers.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Basic Information */}
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your personal and account information.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Your Location
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your location helps us find nearby service providers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiMapPin />

                  {locationLoading
                    ? "Detecting..."
                    : "Detect My Location"}
                </button>
              </div>

              {/* Coordinates Status */}
              {formData.latitude && formData.longitude && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <FiCheckCircle className="text-green-600" size={20} />

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Location detected
                    </p>

                    <p className="text-xs text-green-700">
                      Latitude: {formData.latitude} · Longitude:{" "}
                      {formData.longitude}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    District
                  </label>

                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Enter your district"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Province */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Province
                  </label>

                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Enter your province"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/customer/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegister;