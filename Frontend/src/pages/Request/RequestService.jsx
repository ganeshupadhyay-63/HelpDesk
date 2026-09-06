import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiNavigation,
  FiSend,
  FiShield,
  FiTool,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { getServiceById } from "../../services/service.api";
import { createServiceRequest } from "../../services/serviceRequest.api";

/* -------------------------------------------------------
   Distance helper
------------------------------------------------------- */

const calculateDistance = (latitude1, longitude1, latitude2, longitude2) => {
  const toRadians = (value) => (value * Math.PI) / 180;

  const earthRadius = 6371;

  const dLatitude = toRadians(latitude2 - latitude1);
  const dLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

/* -------------------------------------------------------
   Main component
------------------------------------------------------- */

const RequestService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(location.state?.service || null);

  const [customerLocation] = useState(location.state?.customerLocation || null);

  const [loading, setLoading] = useState(!location.state?.service);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [submittedRequest, setSubmittedRequest] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    address: customerLocation?.address || "",
    city: customerLocation?.city || "",
    district: customerLocation?.district || "",
    description: "",
    preferredDate: "",
  });

  /* -------------------------------------------------------
     Fetch service
  ------------------------------------------------------- */

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
          throw new Error(data?.message || "Unable to load service.");
        }

        setService(data.service);
      } catch (err) {
        console.error("Request service fetch error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load service.",
        );
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

  /* -------------------------------------------------------
     Service information
  ------------------------------------------------------- */

  const provider = service?.provider || {};

  const category = service?.category || {};

  const serviceName = service?.name || "Service";

  const providerName = provider?.fullName || "Service Provider";

  const categoryName =
    typeof category === "string"
      ? category
      : category?.name || "Professional Service";

  const basePrice = Number(service?.basePrice || 0);

  const priceUnit = service?.priceUnit || "service";

  const isAvailable = service?.isAvailable !== false;

  const isActive = service?.isActive !== false;

  /* -------------------------------------------------------
     Provider coordinates

     Backend provider location uses:
     coordinates: [longitude, latitude]
  ------------------------------------------------------- */

  const providerCoordinates = provider?.location?.coordinates;

  const providerLongitude = Array.isArray(providerCoordinates)
    ? Number(providerCoordinates[0])
    : null;

  const providerLatitude = Array.isArray(providerCoordinates)
    ? Number(providerCoordinates[1])
    : null;

  const customerLatitude = Number(
    customerLocation?.latitude ?? customerLocation?.coordinates?.latitude,
  );

  const customerLongitude = Number(
    customerLocation?.longitude ?? customerLocation?.coordinates?.longitude,
  );

  const hasCustomerCoordinates =
    Number.isFinite(customerLatitude) && Number.isFinite(customerLongitude);

  const hasProviderCoordinates =
    Number.isFinite(providerLatitude) && Number.isFinite(providerLongitude);

  /* -------------------------------------------------------
     Distance and price estimate
  ------------------------------------------------------- */

  const pricing = useMemo(() => {
    if (!hasCustomerCoordinates || !hasProviderCoordinates) {
      return {
        distance: null,
        travelCharge: 0,
        totalPrice: basePrice,
      };
    }

    const distance = calculateDistance(
      customerLatitude,
      customerLongitude,
      providerLatitude,
      providerLongitude,
    );

    const roundedDistance = Math.round(distance * 100) / 100;

    /*
      Backend pricing:
      First 2 km = free
      Beyond 2 km = Rs.20 per chargeable km
      Chargeable km = ceil(distance - 2)
    */

    const chargeableKm =
      roundedDistance > 2 ? Math.ceil(roundedDistance - 2) : 0;

    const travelCharge = chargeableKm * 20;

    return {
      distance: roundedDistance,
      travelCharge,
      totalPrice: basePrice + travelCharge,
    };
  }, [
    basePrice,
    customerLatitude,
    customerLongitude,
    providerLatitude,
    providerLongitude,
    hasCustomerCoordinates,
    hasProviderCoordinates,
  ]);

  /* -------------------------------------------------------
     Minimum date
  ------------------------------------------------------- */

  const minDate = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* -------------------------------------------------------
     Form handlers
  ------------------------------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error("Please enter your name.");
      return false;
    }

    if (!formData.customerPhone.trim()) {
      toast.error("Please enter your phone number.");
      return false;
    }

    const phone = formData.customerPhone.replace(/\s/g, "");

    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter your service address.");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter your city.");
      return false;
    }

    if (!formData.district.trim()) {
      toast.error("Please enter your district.");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please describe what service you need.");
      return false;
    }

    if (formData.description.trim().length < 10) {
      toast.error("Please provide a little more detail about the service.");
      return false;
    }

    if (!formData.preferredDate) {
      toast.error("Please select a preferred date.");
      return false;
    }

    return true;
  };

  /* -------------------------------------------------------
     Submit request
  ------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!service?._id) {
      toast.error("Service information is unavailable.");
      return;
    }

    if (!isAvailable || !isActive) {
      toast.error("This service is currently unavailable.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customerName: formData.customerName.trim(),

        customerPhone: formData.customerPhone.trim(),

        customerLocation: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),
          coordinates: {
            latitude: hasCustomerCoordinates ? customerLatitude : null,
            longitude: hasCustomerCoordinates ? customerLongitude : null,
          },
        },

        service: service._id,

        description: formData.description.trim(),

        preferredDate: formData.preferredDate,
      };

      const data = await createServiceRequest(payload);

      if (!data?.success) {
        throw new Error(data?.message || "Unable to submit service request.");
      }

      const createdRequest =
        data?.request || data?.serviceRequest || (data?._id ? data : null);

      if (!createdRequest?._id) {
        throw new Error(
          "Request was created, but the request ID was not returned.",
        );
      }

      setSubmittedRequest(createdRequest);

      toast.success("Service request sent successfully!");
    } catch (err) {
      console.error("Create service request error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit service request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     Loading state
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 space-y-5">
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>

            <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Error state
  ------------------------------------------------------- */

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiX size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Load Service
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "The requested service could not be found."}
          </p>

          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft size={16} />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Success screen
  ------------------------------------------------------- */

  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FiTool size={20} />
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  HelpDesk
                </h1>

                <p className="hidden text-[11px] text-slate-400 sm:block">
                  Local services, made simple
                </p>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCheckCircle size={42} />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-emerald-600">
              Request Submitted
            </p>

            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Your service request has been sent!
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
              {providerName} has received your request. The provider can review
              your request and respond to it.
            </p>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Service</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {serviceName}
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                  Pending
                </span>
              </div>

              <div className="my-4 h-px bg-slate-200" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Customer</p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formData.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Preferred Date</p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formData.preferredDate}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-400">Estimated Amount</p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  Rs. {pricing.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {submittedRequest?._id && (
                <Link
                  to={`/request/status/${submittedRequest._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Track Request
                  <FiArrowRight size={16} />
                </Link>
              )}

              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Search More Services
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------
     Main UI
  ------------------------------------------------------- */

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
              <h1 className="text-lg font-extrabold text-slate-900">
                HelpDesk
              </h1>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Local services, made simple
              </p>
            </div>
          </Link>

          <Link
            to={`/service/${service._id}`}
            state={{
              service,
              customerLocation,
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Service</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <span>/</span>

          <Link to="/search" className="hover:text-blue-600">
            Search
          </Link>

          <span>/</span>

          <Link
            to={`/service/${service._id}`}
            state={{
              service,
              customerLocation,
            }}
            className="max-w-[180px] truncate hover:text-blue-600"
          >
            {serviceName}
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-800">Request Service</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Form */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiSend size={20} />
                </div>

                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Request This Service
                  </h1>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Tell the provider what you need and where you need the
                    service.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              {/* Customer information */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FiUser size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Your Information
                    </h2>

                    <p className="text-xs text-slate-400">
                      The provider will use this information to contact you.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />

                  <InputField
                    label="Phone Number"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-slate-100" />

              {/* Location */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FiMapPin size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Service Location
                    </h2>

                    <p className="text-xs text-slate-400">
                      Where should the provider come?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <InputField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, landmark..."
                    required
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      required
                    />

                    <InputField
                      label="District"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Enter district"
                      required
                    />
                  </div>
                </div>

                {hasCustomerCoordinates ? (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                    <FiNavigation
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        Location coordinates detected
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                        Your current location will help calculate the applicable
                        travel charge.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                    <FiMapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Location coordinates unavailable
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-amber-700">
                        Your address will still be sent to the provider, but
                        travel distance cannot be estimated automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="my-8 h-px bg-slate-100" />

              {/* Service details */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <FiTool size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Service Details
                    </h2>

                    <p className="text-xs text-slate-400">
                      Explain what you need help with.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      What do you need?
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe the problem or service you need. For example: My water pump is not working and needs inspection and repair."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                      <span>Provide enough information for the provider.</span>

                      <span>{formData.description.length}/1000</span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="preferredDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Preferred Date
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <FiCalendar
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="preferredDate"
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        min={minDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting || !isAvailable || !isActive}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm transition ${
                    submitting || !isAvailable || !isActive
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      Send Service Request
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  By submitting this request, you are sharing your contact and
                  service details with the selected provider.
                </p>
              </div>
            </form>
          </section>

          {/* Right Summary */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Service card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <FiTool size={13} />
                  {categoryName}
                </span>

                <h2 className="mt-4 text-xl font-extrabold">{serviceName}</h2>

                <p className="mt-2 text-sm text-blue-100">
                  Provided by {providerName}
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Base Price
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      Rs. {basePrice.toLocaleString()}
                    </p>
                  </div>

                  <span className="pb-1 text-xs font-medium text-slate-400">
                    / {priceUnit}
                  </span>
                </div>

                <div className="my-5 h-px bg-slate-100" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FiUser size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {providerName}
                    </p>

                    <p className="text-xs text-slate-400">Service Provider</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Estimated Cost
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Base service</span>

                  <span className="text-sm font-semibold text-slate-800">
                    Rs. {basePrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    Travel charge
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    Rs. {pricing.travelCharge.toLocaleString()}
                  </span>
                </div>

                {pricing.distance !== null && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Estimated distance
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        {pricing.distance} km
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      First 2 km are free. Additional chargeable distance is
                      calculated at Rs.20/km.
                    </p>
                  </div>
                )}

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-900">
                    Estimated Total
                  </span>

                  <span className="text-xl font-extrabold text-blue-600">
                    Rs. {pricing.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-4 text-slate-400">
                This is an estimate. The final amount may change depending on
                the actual service requirements.
              </p>
            </div>

            {/* Trust */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiShield size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Your information is shared securely
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your name, phone number, location and service requirements
                    will be sent to this provider so they can respond to your
                    request.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* -------------------------------------------------------
   Reusable input
------------------------------------------------------- */

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
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

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

export default RequestService;
