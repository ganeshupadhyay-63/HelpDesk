import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTool,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import {
  cancelServiceRequest,
  getServiceRequestById,
} from "../../services/serviceRequest.api";

const statusConfig = {
  Pending: {
    label: "Pending",
    icon: FiClock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Accepted: {
    label: "Accepted",
    icon: FiCheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rejected: {
    label: "Rejected",
    icon: FiXCircle,
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  Cancelled: {
    label: "Cancelled",
    icon: FiX,
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  Completed: {
    label: "Completed",
    icon: FiCheck,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
};

const RequestStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const fetchRequest = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setError("Request ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getServiceRequestById(id);

        if (!data?.success || !data?.request) {
          throw new Error(
            data?.message || "Unable to load request."
          );
        }

        setRequest(data.request);
      } catch (err) {
        console.error("Request status error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load request."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const status = request?.status || "Pending";

  const config =
    statusConfig[status] || statusConfig.Pending;

  const StatusIcon = config.icon;

  const service = request?.service || {};
  const provider = request?.provider || {};

  const serviceName =
    service?.name || "Requested Service";

  const providerName =
    provider?.fullName || "Service Provider";

  const basePrice = Number(request?.basePrice || 0);
  const travelCharge = Number(
    request?.travelCharge || 0
  );
  const totalPrice = Number(
    request?.totalPrice || basePrice + travelCharge
  );

  const preferredDate = request?.preferredDate
    ? new Date(request.preferredDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Not specified";

  const locationText = [
    request?.customerLocation?.address,
    request?.customerLocation?.city,
    request?.customerLocation?.district,
  ]
    .filter(Boolean)
    .join(", ");

  const canCancel =
    status === "Pending" ||
    status === "Accepted";

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this service request?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const data = await cancelServiceRequest(id);

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to cancel request."
        );
      }

      toast.success("Service request cancelled.");

      await fetchRequest(true);
    } catch (err) {
      console.error("Cancel request error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to cancel request."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 h-16 animate-pulse rounded-2xl bg-slate-200" />
              <div className="mt-6 space-y-4">
                <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>

            <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiXCircle size={30} />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            Unable to Load Request
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Request could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => fetchRequest()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <FiRefreshCw size={16} />
              Try Again
            </button>

            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Search Services
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
          <Link
            to="/"
            className="flex items-center gap-3"
          >
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

          <button
            type="button"
            onClick={() => fetchRequest(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            to="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-800">
            Request Status
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main status */}
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Service Request
                    </p>

                    <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                      {serviceName}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Request ID:{" "}
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {request._id}
                      </span>
                    </p>
                  </div>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${config.className}`}
                  >
                    <StatusIcon size={16} />
                    {config.label}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-5 sm:p-7">
                <h2 className="text-sm font-bold text-slate-900">
                  Request Progress
                </h2>

                <div className="mt-6">
                  <RequestTimeline status={status} />
                </div>
              </div>
            </div>

            {/* Provider response */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUser size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Service Provider
                  </h2>

                  <p className="text-xs text-slate-400">
                    Provider response and information
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {provider?.profileImage ? (
                    <img
                      src={provider.profileImage}
                      alt={providerName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser
                      size={24}
                      className="text-slate-400"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {providerName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {provider?.serviceName ||
                      serviceName}
                  </p>
                </div>

                {provider?.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition hover:bg-blue-50"
                    aria-label="Call provider"
                  >
                    <FiPhone size={17} />
                  </a>
                )}
              </div>

              {request.providerMessage && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-800">
                    Provider Message
                  </p>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    {request.providerMessage}
                  </p>
                </div>
              )}

              {!request.providerMessage &&
                status === "Pending" && (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-800">
                      Waiting for provider response
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      The provider has not responded to your
                      request yet. Check again later.
                    </p>
                  </div>
                )}
            </div>

            {/* Request details */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">
                Request Details
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={FiUser}
                  label="Customer"
                  value={
                    request.customerName ||
                    "Not available"
                  }
                />

                <InfoItem
                  icon={FiPhone}
                  label="Phone"
                  value={
                    request.customerPhone ||
                    "Not available"
                  }
                />

                <InfoItem
                  icon={FiCalendar}
                  label="Preferred Date"
                  value={preferredDate}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="Service Location"
                  value={
                    locationText ||
                    "Location not available"
                  }
                />
              </div>

              {request.description && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Service Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {request.description}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Cost */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Request Cost
              </h2>

              <div className="mt-5 space-y-4">
                <PriceRow
                  label="Base Service"
                  value={basePrice}
                />

                <PriceRow
                  label="Travel Charge"
                  value={travelCharge}
                />

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-extrabold text-blue-600">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-4 text-slate-400">
                The final amount may change depending on
                actual service requirements.
              </p>
            </div>

            {/* Request summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Quick Summary
              </h2>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  label="Service"
                  value={serviceName}
                />

                <SummaryRow
                  label="Provider"
                  value={providerName}
                />

                <SummaryRow
                  label="Date"
                  value={preferredDate}
                />

                <SummaryRow
                  label="Distance"
                  value={
                    request.distance !== undefined &&
                    request.distance !== null
                      ? `${Number(
                          request.distance
                        ).toFixed(2)} km`
                      : "Not available"
                  }
                />

                <SummaryRow
                  label="Status"
                  value={status}
                />
              </div>
            </div>

            {/* Cancel */}
            {canCancel && (
              <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <FiXCircle size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Need to cancel?
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      You can cancel this request while it is
                      still active.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FiX size={16} />
                      Cancel Request
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <FiShield
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Your request information is shared only
                  with the selected service provider for
                  handling your service request.
                </p>
              </div>
            </div>

            <Link
              to="/search"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <FiSend size={16} />
              Find Another Service
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* -------------------------------------------------------
   Timeline
------------------------------------------------------- */

const RequestTimeline = ({ status }) => {
  const steps = [
    {
      key: "Pending",
      label: "Request Sent",
      description: "Your request has been sent.",
    },
    {
      key: "Accepted",
      label: "Accepted",
      description: "Provider accepted your request.",
    },
    {
      key: "Completed",
      label: "Completed",
      description: "Service has been completed.",
    },
  ];

  const rejected =
    status === "Rejected";

  const cancelled =
    status === "Cancelled";

  if (rejected || cancelled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              rejected
                ? "bg-red-50 text-red-500"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {rejected ? (
              <FiXCircle size={21} />
            ) : (
              <FiX size={21} />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Request {rejected ? "Rejected" : "Cancelled"}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {rejected
                ? "The provider has rejected this service request."
                : "This service request has been cancelled."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex =
    status === "Pending"
      ? 0
      : status === "Accepted"
      ? 1
      : 2;

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const completed = index <= activeIndex;

        return (
          <div
            key={step.key}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            {index < steps.length - 1 && (
              <div
                className={`absolute left-5 top-10 h-[calc(100%-8px)] w-0.5 ${
                  index < activeIndex
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                completed
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {completed ? (
                <FiCheck size={17} />
              ) : (
                <span className="text-xs font-bold">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="pt-1">
              <p
                className={`text-sm font-bold ${
                  completed
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------
   Info item
------------------------------------------------------- */

const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Price row
------------------------------------------------------- */

const PriceRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        Rs. {Number(value || 0).toLocaleString()}
      </span>
    </div>
  );
};

/* -------------------------------------------------------
   Summary row
------------------------------------------------------- */

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="shrink-0 text-xs text-slate-400">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
};

export default RequestStatus;