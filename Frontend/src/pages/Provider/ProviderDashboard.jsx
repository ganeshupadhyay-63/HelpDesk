import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiRefreshCw,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/provider/NotificationBell";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { provider, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =========================================================
     FETCH DASHBOARD
  ========================================================= */

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get("/provider/dashboard");

        const data = response.data;

        if (!data?.success) {
          throw new Error(data?.message || "Unable to load dashboard.");
        }

        setDashboard(data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard.";

        setError(message);

        if (err.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");

          await logout();

          navigate("/provider/login", {
            replace: true,
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [logout, navigate],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const requests = dashboard?.requests || {};
    const services = dashboard?.services || {};
    const revenue = dashboard?.revenue || {};

    return [
      {
        title: "Total Requests",
        value: requests.total ?? 0,
        icon: FiActivity,
        description: "All service requests",
        iconBg: "bg-blue-50 text-blue-600",
        to: "/provider/requests",
      },
      {
        title: "Pending",
        value: requests.pending ?? 0,
        icon: FiClock,
        description: "Waiting for response",
        iconBg: "bg-amber-50 text-amber-600",
        to: "/provider/requests",
      },
      {
        title: "Accepted",
        value: requests.accepted ?? 0,
        icon: FiCheckCircle,
        description: "Active bookings",
        iconBg: "bg-indigo-50 text-indigo-600",
        to: "/provider/requests",
      },
      {
        title: "Completed",
        value: requests.completed ?? 0,
        icon: FiCheckCircle,
        description: "Successfully completed",
        iconBg: "bg-emerald-50 text-emerald-600",
        to: "/provider/requests",
      },
      {
        title: "Revenue",
        value: `Rs. ${Number(revenue.total ?? 0).toLocaleString()}`,
        icon: FiDollarSign,
        description: "From completed services",
        iconBg: "bg-violet-50 text-violet-600",
        to: "/provider/requests",
      },
      {
        title: "My Services",
        value: services.total ?? 0,
        icon: FiBriefcase,
        description: `${services.active ?? 0} active services`,
        iconBg: "bg-cyan-50 text-cyan-600",
        to: "/provider/services",
      },
    ];
  }, [dashboard]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const recentRequests = dashboard?.recentRequests || [];

  const currentProvider = dashboard?.provider || provider;

  const rating = Number(dashboard?.rating ?? currentProvider?.rating ?? 0);

  const isAvailable =
    currentProvider?.isAvailable ?? provider?.isAvailable ?? false;

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  /* =========================================================
     COMING SOON
  ========================================================= */

  const comingSoon = (feature) => {
    toast.info(`${feature} will be available soon.`);
    setMobileMenu(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully.");

      navigate("/provider/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <DashboardLoading />;
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenu && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}

        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FiActivity size={19} />
            </div>

            <span className="text-lg font-bold text-slate-900">
              Help
              <span className="text-blue-600">Desk</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Provider Mini Profile */}

        <div className="border-b border-slate-100 p-4">
          <Link
            to="/provider/profile"
            onClick={closeMobileMenu}
            className="group flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50"
          >
            <ProviderAvatar provider={currentProvider} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 group-hover:text-blue-700">
                {currentProvider?.fullName || "Provider"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {currentProvider?.serviceName || "Service Provider"}
              </p>
            </div>

            <FiArrowRight
              size={15}
              className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
            />
          </Link>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <SidebarLink
            to="/provider/dashboard"
            icon={FiGrid}
            label="Dashboard"
            active
            onClick={closeMobileMenu}
          />

          <SidebarLink
            to="/provider/services"
            icon={FiBriefcase}
            label="My Services"
            onClick={closeMobileMenu}
          />

          <SidebarLink
            to="/provider/requests"
            icon={FiActivity}
            label="Service Requests"
            onClick={closeMobileMenu}
          />

          <button
            type="button"
            onClick={() => comingSoon("Bookings")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <FiCalendar size={18} />
            <span>Bookings</span>

            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
              Soon
            </span>
          </button>

          <button
            type="button"
            onClick={() => comingSoon("Messages")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <FiMessageSquare size={18} />
            <span>Messages</span>

            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
              Soon
            </span>
          </button>

          <div className="my-4 border-t border-slate-100" />

          <SidebarLink
            to="/provider/profile"
            icon={FiUser}
            label="My Profile"
            onClick={closeMobileMenu}
          />

          <button
            type="button"
            onClick={() => comingSoon("Settings")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <FiSettings size={18} />
            <span>Settings</span>

            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
              Soon
            </span>
          </button>
        </nav>

        {/* Account Status */}

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />

              <span className="text-xs font-bold text-slate-700">
                {isAvailable ? "Currently Available" : "Currently Unavailable"}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Manage availability from your profile.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="lg:pl-64">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left */}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenu(true)}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <FiMenu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Provider Portal
                </p>

                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  Dashboard
                </h1>
              </div>
            </div>

            {/* Right */}

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />

              {/* Availability */}

              <Link
                to="/provider/profile"
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAvailable ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />

                <span className="text-xs font-semibold text-slate-600">
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
              </Link>

              {/* Refresh */}

              <button
                type="button"
                disabled={refreshing}
                onClick={() => fetchDashboard(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh dashboard"
                aria-label="Refresh dashboard"
              >
                <FiRefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              {/* Profile */}

              <Link
                to="/provider/profile"
                className="group hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex"
              >
                <ProviderAvatar provider={currentProvider} small />

                <div className="max-w-40">
                  <p className="truncate text-sm font-bold text-slate-800 group-hover:text-blue-600">
                    {currentProvider?.fullName || "Provider"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {currentProvider?.email || ""}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Error */}

          {error && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FiXCircle className="shrink-0 text-red-500" size={20} />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Unable to load dashboard
                  </p>

                  <p className="mt-0.5 text-xs text-red-600">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchDashboard()}
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* Welcome */}

          <section className="mb-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Welcome back,
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {getFirstName(currentProvider?.fullName)} 👋
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Here's an overview of your service business and recent
                  customer activity.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View Marketplace
                </Link>

                <Link
                  to="/provider/services"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <FiBriefcase size={16} />
                  Manage Services
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================== */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>

          {/* =================================================
              MAIN DASHBOARD GRID
          ================================================== */}

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            {/* Recent Requests */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Service Requests
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest customer requests for your services
                  </p>
                </div>

                <Link
                  to="/provider/requests"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
                >
                  View all
                  <FiArrowRight size={14} />
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <EmptyRequests />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentRequests.slice(0, 5).map((request, index) => (
                    <RequestRow
                      key={request._id || request.id || index}
                      request={request}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Business Overview */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="font-bold text-slate-900">Business Overview</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your provider performance
                </p>
              </div>

              {/* Rating */}

              <Link
                to="/provider/profile"
                className="group mt-6 block rounded-2xl bg-slate-50 p-5 transition hover:bg-amber-50/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Overall Rating
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {rating.toFixed(1)}
                      </span>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={15}
                            className={
                              star <= Math.round(rating)
                                ? "fill-current text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition group-hover:bg-amber-100">
                    <FiStar size={20} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Based on {currentProvider?.totalReviews ?? 0} customer reviews
                </p>
              </Link>

              {/* Completion */}

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Completed Requests
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {dashboard?.requests?.completed ?? 0}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${getCompletionPercentage(dashboard?.requests)}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-right text-[11px] text-slate-400">
                  {getCompletionPercentage(dashboard?.requests)}% completion
                  rate
                </p>
              </div>

              {/* Mini Metrics */}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric
                  to="/provider/requests"
                  label="Accepted"
                  value={dashboard?.requests?.accepted ?? 0}
                  icon={FiCheckCircle}
                />

                <MiniMetric
                  to="/provider/requests"
                  label="Rejected"
                  value={dashboard?.requests?.rejected ?? 0}
                  icon={FiXCircle}
                />

                <MiniMetric
                  to="/provider/services"
                  label="Services"
                  value={dashboard?.services?.total ?? 0}
                  icon={FiBriefcase}
                />

                <MiniMetric
                  to="/provider/services"
                  label="Available"
                  value={dashboard?.services?.available ?? 0}
                  icon={FiTrendingUp}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="mt-6">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">Quick Actions</h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage your provider account quickly.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                to="/provider/services"
                icon={FiBriefcase}
                title="Manage Services"
                description="Add or update services"
              />

              <QuickAction
                to="/provider/requests"
                icon={FiActivity}
                title="Service Requests"
                description="Review customer requests"
              />

              <QuickAction
                to="/provider/profile"
                icon={FiUser}
                title="Update Profile"
                description="Keep your profile updated"
              />

              <QuickAction
                icon={FiSettings}
                title="Settings"
                description="Manage your preferences"
                onClick={() => comingSoon("Settings")}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value, icon: Icon, description, iconBg, to }) => {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{title}</p>

        <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon size={20} />
      </div>
    </div>
  );

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6"
    >
      {content}

      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 transition group-hover:text-blue-600">
        View details
        <FiArrowRight
          size={12}
          className="transition group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
};

/* =========================================================
   REQUEST ROW
========================================================= */

const RequestRow = ({ request }) => {
  const customerName =
    request.customerName || request.customer?.name || "Customer";

  const serviceName =
    request.service?.name || request.serviceName || "Service Request";

  const amount = request.totalPrice ?? request.amount ?? 0;

  const status = request.status || "Pending";

  return (
    <Link
      to="/provider/requests"
      className="flex flex-col gap-4 px-5 py-4 transition hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
          {getInitials(customerName)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            {customerName}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {serviceName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-sm font-bold text-slate-800">
            Rs. {Number(amount).toLocaleString()}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {formatRequestDate(request.createdAt || request.date)}
          </p>
        </div>

        <StatusBadge status={status} />

        <FiArrowRight size={15} className="hidden text-slate-300 sm:block" />
      </div>
    </Link>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    Pending: {
      className: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },

    Accepted: {
      className: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },

    Completed: {
      className: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },

    Rejected: {
      className: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },

    Cancelled: {
      className: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },
  };

  const current = config[status] || config.Pending;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${current.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />

      {status}
    </span>
  );
};

/* =========================================================
   SIDEBAR LINK
========================================================= */

const SidebarLink = ({ to, icon: Icon, label, active = false, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <Icon
        size={18}
        className={
          active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
        }
      />

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
      )}
    </Link>
  );
};

/* =========================================================
   MINI METRIC
========================================================= */

const MiniMetric = ({ to, label, value, icon: Icon }) => {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-100 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <Icon
          size={14}
          className="text-slate-400 transition group-hover:text-blue-500"
        />
      </div>

      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>

      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
        View
        <FiArrowRight size={10} />
      </div>
    </Link>
  );
};

/* =========================================================
   QUICK ACTION
========================================================= */

const QuickAction = ({ to, icon: Icon, title, description, onClick }) => {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <FiArrowRight
        className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
        size={16}
      />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      {content}
    </button>
  );
};

/* =========================================================
   EMPTY REQUESTS
========================================================= */

const EmptyRequests = () => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <FiActivity size={24} />
      </div>

      <h4 className="mt-4 text-sm font-bold text-slate-800">
        No service requests yet
      </h4>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Customer requests will appear here when someone contacts you for a
        service.
      </p>

      <Link
        to="/provider/services"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
      >
        Manage your services
        <FiArrowRight size={13} />
      </Link>
    </div>
  );
};

/* =========================================================
   LOADING
========================================================= */

const DashboardLoading = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading your dashboard...
          </p>

          <p className="mt-1 text-xs text-slate-400">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   PROVIDER AVATAR
========================================================= */

const ProviderAvatar = ({ provider, small = false }) => {
  const image = provider?.profileImage;

  const name = provider?.fullName || "Provider";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`rounded-full border border-slate-100 object-cover ${
          small ? "h-9 w-9" : "h-10 w-10"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${
        small ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {getInitials(name)}
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

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

const getFirstName = (name = "Provider") => {
  return name.trim().split(/\s+/)[0] || "Provider";
};

const formatRequestDate = (date) => {
  if (!date) {
    return "Recently";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCompletionPercentage = (requests = {}) => {
  const total = Number(requests.total) || 0;

  const completed = Number(requests.completed) || 0;

  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((completed / total) * 100));
};

export default ProviderDashboard;
