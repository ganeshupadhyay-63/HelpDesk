import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiEye,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiMessageSquare,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiTool,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

import {
  cancelServiceRequest,
  getProviderRequests,
  updateServiceRequestStatus,
} from "../../services/serviceRequest.api";

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },

  Accepted: {
    label: "Accepted",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },

  Rejected: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },

  Cancelled: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },

  Completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

/* =========================================================
   NAVIGATION
========================================================= */

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/provider/dashboard",
    icon: FiHome,
  },
  {
    label: "My Services",
    path: "/provider/services",
    icon: FiTool,
  },
  {
    label: "Service Requests",
    path: "/provider/requests",
    icon: FiBell,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || "";
};

const getCustomerName = (request) => {
  return request?.customerName || request?.customer?.name || "Unknown Customer";
};

const getCustomerPhone = (request) => {
  return request?.customerPhone || request?.customer?.phone || "Not available";
};

const getServiceName = (request) => {
  if (typeof request?.service === "string") {
    return "Requested Service";
  }

  return request?.service?.name || request?.serviceName || "Requested Service";
};

const getLocationText = (request) => {
  const location = request?.customerLocation || request?.location;

  if (!location) {
    return "Location not provided";
  }

  return (
    [location.address, location.city, location.district]
      .filter(Boolean)
      .join(", ") || "Location not provided"
  );
};

const getCoordinates = (request) => {
  const location = request?.customerLocation || request?.location;

  const coordinates = location?.coordinates;

  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    return coordinates;
  }

  if (
    Array.isArray(coordinates?.coordinates) &&
    coordinates.coordinates.length >= 2
  ) {
    return coordinates.coordinates;
  }

  return null;
};

const getStatusClass = (status) => {
  return (
    STATUS_CONFIG[status]?.className ||
    "border-slate-200 bg-slate-100 text-slate-600"
  );
};

const getStatusDot = (status) => {
  return STATUS_CONFIG[status]?.dot || "bg-slate-400";
};

const formatDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "P";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProviderRequests = () => {
  const navigate = useNavigate();

  const { provider, logout } = useAuth();

  /* =======================================================
     STATE
  ======================================================= */

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showDetails, setShowDetails] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =======================================================
     FETCH REQUESTS
  ======================================================= */

  const fetchRequests = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getProviderRequests();

        if (!data?.success) {
          throw new Error(data?.message || "Unable to load service requests.");
        }

        setRequests(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        console.error("Service requests loading error:", err);

        const status = err?.response?.status;

        if (status === 401) {
          toast.error("Your session has expired. Please login again.");

          await logout();

          navigate("/provider/login", { replace: true });

          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load service requests.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [logout, navigate],
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter((request) => request.status === "Pending")
        .length,

      accepted: requests.filter((request) => request.status === "Accepted")
        .length,

      completed: requests.filter((request) => request.status === "Completed")
        .length,

      rejected: requests.filter((request) => request.status === "Rejected")
        .length,

      cancelled: requests.filter((request) => request.status === "Cancelled")
        .length,
    };
  }, [requests]);

  /* =======================================================
     FILTERED REQUESTS
  ======================================================= */

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return requests.filter((request) => {
      const customerName = getCustomerName(request).toLowerCase();

      const serviceName = getServiceName(request).toLowerCase();

      const phone = getCustomerPhone(request).toLowerCase();

      const location = getLocationText(request).toLowerCase();

      const requestId = getId(request).toLowerCase();

      const matchesSearch =
        !searchText ||
        customerName.includes(searchText) ||
        serviceName.includes(searchText) ||
        phone.includes(searchText) ||
        location.includes(searchText) ||
        requestId.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  /* =======================================================
     OPEN DETAILS
  ======================================================= */

  const openDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  const closeDetails = () => {
    if (actionLoading) {
      return;
    }

    setShowDetails(false);
    setSelectedRequest(null);
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const handleStatusUpdate = async (request, newStatus) => {
    const requestId = getId(request);

    if (!requestId) {
      toast.error("Invalid service request.");

      return;
    }

    try {
      setActionLoading(true);

      const data = await updateServiceRequestStatus(requestId, newStatus);

      if (!data?.success) {
        throw new Error(data?.message || "Unable to update request.");
      }

      let message = "Request updated successfully.";

      if (newStatus === "Accepted") {
        message = "Service request accepted.";
      }

      if (newStatus === "Rejected") {
        message = "Service request rejected.";
      }

      if (newStatus === "Completed") {
        message = "Request marked as completed.";
      }

      toast.success(message);

      setRequests((previous) =>
        previous.map((item) =>
          getId(item) === requestId
            ? {
                ...item,
                status: newStatus,
                providerMessage:
                  data.request?.providerMessage || item.providerMessage,
              }
            : item,
        ),
      );

      if (selectedRequest && getId(selectedRequest) === requestId) {
        setSelectedRequest((previous) => ({
          ...previous,
          status: newStatus,
          providerMessage:
            data.request?.providerMessage || previous?.providerMessage,
        }));
      }
    } catch (err) {
      console.error("Request status update error:", err);

      if (err?.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");

        await logout();

        navigate("/provider/login", { replace: true });

        return;
      }

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update request.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = async (request) => {
    const requestId = getId(request);

    if (!requestId) {
      toast.error("Invalid service request.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this service request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const data = await cancelServiceRequest(requestId);

      if (!data?.success) {
        throw new Error(data?.message || "Unable to cancel request.");
      }

      toast.success("Service request cancelled.");

      setRequests((previous) =>
        previous.map((item) =>
          getId(item) === requestId
            ? {
                ...item,
                status: "Cancelled",
              }
            : item,
        ),
      );

      if (selectedRequest && getId(selectedRequest) === requestId) {
        setSelectedRequest((previous) => ({
          ...previous,
          status: "Cancelled",
        }));
      }
    } catch (err) {
      console.error("Cancel request error:", err);

      if (err?.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");

        await logout();

        navigate("/provider/login", { replace: true });

        return;
      }

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to cancel request.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/provider/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =======================================================
     COMING SOON
  ======================================================= */

  const handleComingSoon = (feature) => {
    setMobileMenuOpen(false);

    toast.info(`${feature} module is coming soon.`);
  };

  /* =======================================================
     ACTION BUTTONS
  ======================================================= */

  const renderActionButtons = (request, compact = false) => {
    const status = request?.status;

    if (status === "Pending") {
      return (
        <div className={`flex ${compact ? "flex-col" : "flex-wrap"} gap-2`}>
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(request, "Accepted")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck size={16} />
            Accept Request
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(request, "Rejected")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={16} />
            Reject
          </button>
        </div>
      );
    }

    if (status === "Accepted") {
      return (
        <div className={`flex ${compact ? "flex-col" : "flex-wrap"} gap-2`}>
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(request, "Completed")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheckCircle size={16} />
            Mark Completed
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleCancel(request)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiXCircle size={16} />
            Cancel Request
          </button>
        </div>
      );
    }

    return null;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===================================================
          DESKTOP SIDEBAR
      ==================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}

          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <Link to="/provider/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <FiActivity size={21} />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">HelpDesk</h1>

                <p className="text-[11px] font-medium text-slate-400">
                  Provider Panel
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}

          <nav className="flex-1 space-y-1 px-4 py-5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              const active = item.path === "/provider/requests";

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />

                  <span>{item.label}</span>

                  {item.label === "Service Requests" &&
                    statistics.pending > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                        {statistics.pending}
                      </span>
                    )}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => handleComingSoon("Bookings")}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <FiCalendar size={18} className="text-slate-400" />

              <span>Bookings</span>

              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleComingSoon("Messages")}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <FiMessageSquare size={18} className="text-slate-400" />

              <span>Messages</span>

              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </button>

            <div className="my-4 border-t border-slate-100" />

            <Link
              to="/provider/profile"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <FiUser
                size={18}
                className="text-slate-400 group-hover:text-slate-600"
              />

              <span>My Profile</span>

              <FiChevronRight
                size={15}
                className="ml-auto text-slate-300 group-hover:text-blue-500"
              />
            </Link>

            <button
              type="button"
              onClick={() => handleComingSoon("Settings")}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <FiSettings size={18} className="text-slate-400" />

              <span>Settings</span>

              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </button>
          </nav>

          {/* Provider */}

          <div className="border-t border-slate-100 p-4">
            <Link
              to="/provider/profile"
              className="group mb-3 block rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50"
            >
              <p className="truncate text-sm font-bold text-slate-800 group-hover:text-blue-700">
                {provider?.fullName || "Service Provider"}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {provider?.email || "Provider account"}
              </p>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MOBILE HEADER
      ==================================================== */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Open menu"
        >
          <FiMenu size={21} />
        </button>

        <Link to="/provider/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FiActivity size={17} />
          </div>

          <span className="font-bold">HelpDesk</span>
        </Link>

        <button
          type="button"
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          aria-label="Refresh requests"
        >
          <FiRefreshCw size={19} className={refreshing ? "animate-spin" : ""} />
        </button>
      </header>

      {/* ===================================================
          MOBILE SIDEBAR
      ==================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/40"
          />

          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FiActivity size={20} />
                </div>

                <div>
                  <p className="font-bold">HelpDesk</p>

                  <p className="text-[11px] text-slate-400">Provider Panel</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close menu"
              >
                <FiX size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FiHome size={18} />
                Dashboard
              </Link>

              <Link
                to="/provider/services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FiTool size={18} />
                My Services
              </Link>

              <Link
                to="/provider/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
              >
                <FiBell size={18} />

                <span>Service Requests</span>

                {statistics.pending > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                    {statistics.pending}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => handleComingSoon("Bookings")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                <FiCalendar size={18} />
                Bookings
                <span className="ml-auto text-[9px] font-bold uppercase text-slate-300">
                  Soon
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleComingSoon("Messages")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                <FiMessageSquare size={18} />
                Messages
                <span className="ml-auto text-[9px] font-bold uppercase text-slate-300">
                  Soon
                </span>
              </button>

              <div className="my-4 border-t border-slate-100" />

              <Link
                to="/provider/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FiUser size={18} />
                My Profile
              </Link>

              <button
                type="button"
                onClick={() => handleComingSoon("Settings")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                <FiSettings size={18} />
                Settings
                <span className="ml-auto text-[9px] font-bold uppercase text-slate-300">
                  Soon
                </span>
              </button>
            </nav>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===================================================
          MAIN
      ==================================================== */}

      <main className="lg:ml-64">
        {/* Desktop Header */}

        <header className="hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
          <div>
            <p className="text-sm text-slate-500">Provider workspace</p>

            <h2 className="mt-0.5 text-xl font-bold text-slate-900">
              Service Requests
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/provider/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
                {provider?.profileImage ? (
                  <img
                    src={provider.profileImage}
                    alt={provider.fullName || "Provider"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {getInitials(provider?.fullName)}
                  </span>
                )}
              </div>

              <div className="max-w-48 text-left">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {provider?.fullName || "Provider"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {provider?.serviceName || "Service Provider"}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FiRefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Breadcrumb */}

          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Link
              to="/provider/dashboard"
              className="transition hover:text-blue-600"
            >
              Dashboard
            </Link>

            <FiChevronRight size={14} />

            <span className="font-medium text-slate-700">Service Requests</span>
          </div>

          {/* Heading */}

          <section className="mb-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Manage Service Requests
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review customer requests, accept new work, and manage ongoing
                  services from one place.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                  {filteredRequests.length} shown
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                  {statistics.total} total
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <RequestStatCard
              label="Total"
              value={statistics.total}
              icon={FiUsers}
              active={statusFilter === "All"}
              onClick={() => setStatusFilter("All")}
            />

            <RequestStatCard
              label="Pending"
              value={statistics.pending}
              icon={FiClock}
              highlight
              active={statusFilter === "Pending"}
              onClick={() => setStatusFilter("Pending")}
            />

            <RequestStatCard
              label="Accepted"
              value={statistics.accepted}
              icon={FiCheckCircle}
              active={statusFilter === "Accepted"}
              onClick={() => setStatusFilter("Accepted")}
            />

            <RequestStatCard
              label="Completed"
              value={statistics.completed}
              icon={FiActivity}
              active={statusFilter === "Completed"}
              onClick={() => setStatusFilter("Completed")}
            />

            <RequestStatCard
              label="Rejected"
              value={statistics.rejected}
              icon={FiXCircle}
              active={statusFilter === "Rejected"}
              onClick={() => setStatusFilter("Rejected")}
            />

            <RequestStatCard
              label="Cancelled"
              value={statistics.cancelled}
              icon={FiX}
              active={statusFilter === "Cancelled"}
              onClick={() => setStatusFilter("Cancelled")}
            />
          </section>

          {/* =================================================
              FILTERS
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              {/* Search */}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <FiSearch
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search customer, service, phone, location or request ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fetchRequests(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 lg:w-auto"
                >
                  <FiRefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh Requests
                </button>
              </div>

              {/* Status Filters */}

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  "All",
                  "Pending",
                  "Accepted",
                  "Completed",
                  "Rejected",
                  "Cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      statusFilter === status
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}

                    {status !== "All" && (
                      <span className="ml-1.5 opacity-70">
                        {statistics[status.toLowerCase()] ?? 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FiXCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div>
                    <p className="font-semibold text-red-800">
                      Unable to load service requests
                    </p>

                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchRequests()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <FiRefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              REQUESTS
          ================================================== */}

          {loading ? (
            <LoadingState />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              hasFilters={Boolean(search.trim()) || statusFilter !== "All"}
              onClear={() => {
                setSearch("");
                setStatusFilter("All");
              }}
            />
          ) : (
            <section className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={getId(request)}
                  request={request}
                  onView={() => openDetails(request)}
                  renderActionButtons={renderActionButtons}
                />
              ))}
            </section>
          )}
        </div>
      </main>

      {/* ===================================================
          DETAILS MODAL
      ==================================================== */}

      {showDetails && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={closeDetails}
          onStatusUpdate={handleStatusUpdate}
          onCancel={handleCancel}
          actionLoading={actionLoading}
          renderActionButtons={renderActionButtons}
        />
      )}
    </div>
  );
};

/* =========================================================
   REQUEST STAT CARD
========================================================= */

const RequestStatCard = ({
  label,
  value,
  icon: Icon,
  highlight = false,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-blue-300 ring-2 ring-blue-500/10"
          : highlight
            ? "border-amber-200"
            : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            highlight
              ? "bg-amber-50 text-amber-600"
              : active
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-400 transition group-hover:text-blue-600">
        Filter
        <FiArrowRight size={11} />
      </div>
    </button>
  );
};

/* =========================================================
   REQUEST CARD
========================================================= */

const RequestCard = ({ request, onView, renderActionButtons }) => {
  const status = request?.status || "Pending";

  const phone = getCustomerPhone(request);

  const coordinates = getCoordinates(request);

  const openMap = () => {
    if (!coordinates || coordinates.length < 2) {
      toast.info("Customer coordinates are not available.");

      return;
    }

    const [first, second] = coordinates;

    const longitude = Number(first);

    const latitude = Number(second);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      toast.info("Customer location coordinates are invalid.");

      return;
    }

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md">
      <div className="p-5 sm:p-6">
        {/* Top */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <span className="text-sm font-bold">
                {getInitials(getCustomerName(request))}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                  {getCustomerName(request)}
                </h3>

                <StatusBadge status={status} />
              </div>

              <p className="mt-1 text-sm font-semibold text-blue-600">
                {getServiceName(request)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Request #{getId(request).slice(-8)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <FiEye size={16} />
            View Details
            <FiArrowRight size={14} />
          </button>
        </div>

        {/* Information */}

        <div className="my-5 grid gap-3 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            icon={FiPhone}
            label="Customer Phone"
            value={phone}
            action={phone !== "Not available" && phone ? `tel:${phone}` : null}
          />

          <InfoItem
            icon={FiMapPin}
            label="Location"
            value={getLocationText(request)}
            onClick={coordinates ? openMap : undefined}
          />

          <InfoItem
            icon={FiCalendar}
            label="Preferred Date"
            value={formatDate(request?.preferredDate)}
          />

          <InfoItem
            icon={FiDollarSign}
            label="Estimated Total"
            value={formatCurrency(request?.totalPrice)}
          />
        </div>

        {/* Description */}

        {request?.description && (
          <div className="mb-5 rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Customer Description
            </p>

            <p className="line-clamp-2 text-sm leading-6 text-slate-600">
              {request.description}
            </p>
          </div>
        )}

        {/* Actions */}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-400">
            Created{" "}
            <span className="font-semibold text-slate-600">
              {formatDateTime(request?.createdAt)}
            </span>
          </div>

          {renderActionButtons(request)}
        </div>
      </div>
    </article>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ icon: Icon, label, value, action, onClick }) => {
  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </>
  );

  if (action) {
    return (
      <a
        href={action}
        className="flex min-w-0 gap-3 rounded-xl p-1 transition hover:bg-slate-50"
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 gap-3 rounded-xl p-1 text-left transition hover:bg-blue-50"
      >
        {content}
      </button>
    );
  }

  return <div className="flex min-w-0 gap-3 rounded-xl p-1">{content}</div>;
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
        status,
      )}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`} />

      {STATUS_CONFIG[status]?.label || status}
    </span>
  );
};

/* =========================================================
   DETAILS MODAL
========================================================= */

const RequestDetailsModal = ({
  request,
  onClose,
  onStatusUpdate,
  onCancel,
  actionLoading,
  renderActionButtons,
}) => {
  const status = request?.status || "Pending";

  const coordinates = getCoordinates(request);

  const openMap = () => {
    if (!coordinates || coordinates.length < 2) {
      toast.info("Customer coordinates are not available.");

      return;
    }

    const longitude = Number(coordinates[0]);

    const latitude = Number(coordinates[1]);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      toast.info("Invalid customer coordinates.");

      return;
    }

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !actionLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actionLoading, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Request Details
              </h2>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 truncate text-xs text-slate-500">
              Request #{getId(request)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close details"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Customer */}

          <div className="mb-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <span className="font-bold">
                  {getInitials(getCustomerName(request))}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-slate-900">
                  {getCustomerName(request)}
                </h3>

                {getCustomerPhone(request) !== "Not available" && (
                  <a
                    href={`tel:${getCustomerPhone(request)}`}
                    className="mt-1 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <FiPhone size={14} />

                    {getCustomerPhone(request)}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Service */}

          <DetailSection title="Service Information">
            <DetailRow label="Service" value={getServiceName(request)} />

            <DetailRow
              label="Preferred Date"
              value={formatDate(request?.preferredDate)}
            />

            <DetailRow
              label="Request Created"
              value={formatDateTime(request?.createdAt)}
            />

            {request?.distance !== undefined && (
              <DetailRow
                label="Distance"
                value={`${Number(request.distance).toFixed(2)} km`}
              />
            )}
          </DetailSection>

          {/* Location */}

          <DetailSection title="Customer Location">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <FiMapPin size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {getLocationText(request)}
                  </p>

                  {coordinates && (
                    <button
                      type="button"
                      onClick={openMap}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <FiMapPin size={13} />
                      Open in Google Maps
                      <FiArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </DetailSection>

          {/* Pricing */}

          <DetailSection title="Pricing">
            <DetailRow
              label="Base Price"
              value={formatCurrency(request?.basePrice)}
            />

            <DetailRow
              label="Travel Charge"
              value={formatCurrency(request?.travelCharge)}
            />

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">Total Price</span>

              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(request?.totalPrice)}
              </span>
            </div>
          </DetailSection>

          {/* Description */}

          {request?.description && (
            <DetailSection title="Customer Description">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {request.description}
                </p>
              </div>
            </DetailSection>
          )}

          {/* Provider Message */}

          {request?.providerMessage && (
            <DetailSection title="Provider Message">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm leading-6 text-blue-800">
                  {request.providerMessage}
                </p>
              </div>
            </DetailSection>
          )}
        </div>

        {/* Footer */}

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Close
            </button>

            <div className="flex flex-wrap justify-end gap-2">
              {renderActionButtons(request)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL SECTION
========================================================= */

const DetailSection = ({ title, children }) => {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{title}</h3>

      {children}
    </section>
  );
};

/* =========================================================
   DETAIL ROW
========================================================= */

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ hasFilters, onClear }) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FiBell size={27} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {hasFilters ? "No matching requests" : "No service requests yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter to find other requests."
          : "When customers request your services, their requests will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiRefreshCw size={15} />
          Clear Filters
        </button>
      )}

      {!hasFilters && (
        <Link
          to="/provider/services"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <FiTool size={15} />
          Manage Services
          <FiArrowRight size={14} />
        </Link>
      )}
    </div>
  );
};

/* =========================================================
   LOADING
========================================================= */

const LoadingState = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-slate-200" />

              <div className="h-3 w-1/2 rounded bg-slate-200" />

              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderRequests;
