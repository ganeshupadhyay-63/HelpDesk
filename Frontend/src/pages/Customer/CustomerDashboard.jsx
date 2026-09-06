import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiSearch,
  FiSend,
  FiShield,
  FiStar,
  FiUsers,
  FiXCircle,
  FiMenu,
} from "react-icons/fi";
import { toast } from "react-toastify";

import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CategoryCard from "../../components/customer/CategoryCard";
import Footer from "../../components/customer/Footer";
import api from "../../services/api";
import { getCustomerRequests } from "../../services/serviceRequest.api";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [mobileOpen, setMobileOpen] = useState(false);

  const [customer, setCustomer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================
  // CUSTOMER
  // ============================================================

  const fetchCustomer = async () => {
    try {
      setLoadingCustomer(true);

      const response = await api.get("/customer/me");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load customer profile",
        );
      }

      const customerData =
        response.data?.customer || response.data?.data || null;

      setCustomer(customerData);
    } catch (error) {
      console.error("Customer Dashboard Profile Error:", error);

      setCustomer(null);

      // Don't spam toast for dashboard profile loading.
    } finally {
      setLoadingCustomer(false);
    }
  };

  // ============================================================
  // CATEGORIES
  // ============================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await api.get("/category/all");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load categories");
      }

      const categoryData =
        response.data?.categories || response.data?.data || [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Customer Categories Error:", error);

      setCategories([]);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load categories",
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  // ============================================================
  // PROVIDERS
  // ============================================================

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);

      const response = await api.get("/provider/all");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load providers");
      }

      const providerData =
        response.data?.providers || response.data?.data || [];

      setProviders(Array.isArray(providerData) ? providerData.slice(0, 6) : []);
    } catch (error) {
      console.error("Customer Providers Error:", error);

      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  // ============================================================
  // CUSTOMER REQUESTS
  // ============================================================

  const fetchCustomerRequests = async () => {
    try {
      setLoadingRequests(true);

      const data = await getCustomerRequests();

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load service requests");
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      console.error("Customer Requests Error:", error);

      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCustomer();
    fetchCategories();
    fetchProviders();
    fetchCustomerRequests();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchQuery.trim();

    if (!value) {
      navigate("/search");
      return;
    }

    navigate(`/search?service=${encodeURIComponent(value)}`);
  };

  // ============================================================
  // CATEGORY CLICK
  // ============================================================

  const handleCategoryClick = (category) => {
    if (!category?.name) {
      navigate("/search");
      return;
    }

    navigate(`/search?service=${encodeURIComponent(category.name)}`);
  };

  // ============================================================
  // PROVIDER HELPERS
  // ============================================================

  const getCategoryName = (provider) => {
    if (typeof provider?.category === "object") {
      return provider.category?.name || "Service Provider";
    }

    return provider?.category || "Service Provider";
  };

  const getRating = (provider) => {
    const rating = Number(provider?.rating || 0);

    return Number.isFinite(rating) ? rating.toFixed(1) : "0.0";
  };

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

  // ============================================================
  // REQUEST HELPERS
  // ============================================================

  const getRequestServiceName = (request) => {
    return request?.service?.name || request?.serviceName || "Service Request";
  };

  const getRequestProviderName = (request) => {
    return (
      request?.provider?.fullName || request?.providerName || "Service Provider"
    );
  };

  const getRequestCity = (request) => {
    return (
      request?.customerLocation?.city ||
      request?.customerLocation?.district ||
      "Location unavailable"
    );
  };

  const getRequestDate = (request) => {
    if (!request?.createdAt) {
      return "Recently";
    }

    const date = new Date(request.createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPreferredDate = (request) => {
    if (!request?.preferredDate) {
      return null;
    }

    const date = new Date(request.preferredDate);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "Accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";

      case "Cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FiClock size={12} />;

      case "Accepted":
        return <FiCheckCircle size={12} />;

      case "Completed":
        return <FiCheckCircle size={12} />;

      case "Rejected":
        return <FiXCircle size={12} />;

      case "Cancelled":
        return <FiXCircle size={12} />;

      default:
        return <FiClock size={12} />;
    }
  };

  // ============================================================
  // REQUEST STATISTICS
  // ============================================================

  const requestStats = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter((request) => request.status === "Pending")
        .length,

      accepted: requests.filter((request) => request.status === "Accepted")
        .length,

      completed: requests.filter((request) => request.status === "Completed")
        .length,
    };
  }, [requests]);

  // ============================================================
  // RECENT REQUESTS
  // ============================================================

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [requests]);

  // ============================================================
  // UPCOMING SERVICE
  // ============================================================

  const upcomingBooking = useMemo(() => {
    return requests
      .filter((request) => request.status === "Accepted")
      .sort(
        (a, b) =>
          new Date(a.preferredDate || a.createdAt || 0) -
          new Date(b.preferredDate || b.createdAt || 0),
      )[0];
  }, [requests]);

  // ============================================================
  // PROVIDER SKELETON
  // ============================================================

  const ProviderSkeleton = () => {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200" />

          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-slate-200" />

            <div className="mt-2 h-3 w-24 rounded bg-slate-200" />

            <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
          </div>
        </div>

        <div className="mt-5 h-10 rounded-xl bg-slate-200" />
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ====================================================== */}
      {/* CUSTOMER SIDEBAR */}
      {/* ====================================================== */}

      <CustomerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <div className="lg:ml-64">
        {/* ==================================================== */}
        {/* MOBILE HEADER */}
        {/* ==================================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
          >
            <FiMenu size={22} />
          </button>

          <Link
            to="/customer/dashboard"
            className="text-lg font-black text-slate-900"
          >
            Help<span className="text-blue-600">Desk</span>
          </Link>

          <Link
            to="/customer/profile"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white"
          >
            {customer?.profileImage ? (
              <img
                src={customer.profileImage}
                alt={customer?.fullName || "Customer"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(customer?.fullName || "Customer")
            )}
          </Link>
        </header>

        {/* ==================================================== */}
        {/* DESKTOP TOP BAR */}
        {/* ==================================================== */}

        <header className="hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:flex xl:px-8">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Customer Dashboard
            </p>

            <h1 className="mt-0.5 text-lg font-black text-slate-900">
              Welcome back
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
            >
              <FiSearch size={15} />
              Find a Service
            </Link>

            <Link
              to="/customer/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <FiClock size={18} />
            </Link>

            <Link
              to="/customer/profile"
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-black text-white">
                {customer?.profileImage ? (
                  <img
                    src={customer.profileImage}
                    alt={customer?.fullName || "Customer"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(customer?.fullName || "Customer")
                )}
              </div>

              <div className="hidden xl:block">
                <p className="text-xs font-black text-slate-900">
                  {loadingCustomer
                    ? "Loading..."
                    : customer?.fullName || "Customer"}
                </p>

                <p className="text-[10px] text-slate-400">Customer</p>
              </div>
            </Link>
          </div>
        </header>

        <main>
          {/* ================================================== */}
          {/* WELCOME + SEARCH */}
          {/* ================================================== */}

          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Hello,{" "}
                    {loadingCustomer
                      ? "there"
                      : customer?.fullName?.split(" ")[0] || "Customer"}{" "}
                    👋
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    What service do you need today?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Find trusted local professionals and request the service you
                    need from one place.
                  </p>

                  {customer?.location?.city && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <FiMapPin size={13} className="text-blue-600" />

                      {customer.location.city}
                      {customer.location.district
                        ? `, ${customer.location.district}`
                        : ""}
                    </div>
                  )}
                </div>

                {/* Search */}
                <form
                  onSubmit={handleSearch}
                  className="flex w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm"
                >
                  <FiSearch
                    size={18}
                    className="ml-3 shrink-0 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search electrician, plumber, AC technician..."
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* QUICK ACTIONS */}
          {/* ================================================== */}

          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Link
                to="/search"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                  <FiSearch size={18} />
                </div>

                <h3 className="mt-3 text-sm font-black text-slate-900">
                  Find a Service
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Search local professionals
                </p>
              </Link>

              <Link
                to="/customer/requests"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white">
                  <FiFileText size={18} />
                </div>

                <h3 className="mt-3 text-sm font-black text-slate-900">
                  My Requests
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {requestStats.total} total requests
                </p>
              </Link>

              <Link
                to="/customer/bookings"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
                  <FiCalendar size={18} />
                </div>

                <h3 className="mt-3 text-sm font-black text-slate-900">
                  My Bookings
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {requestStats.accepted} accepted services
                </p>
              </Link>

              <Link
                to="/customer/profile"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
                  <FiUsers size={18} />
                </div>

                <h3 className="mt-3 text-sm font-black text-slate-900">
                  My Profile
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your account
                </p>
              </Link>
            </div>
          </section>

          {/* ================================================== */}
          {/* STATISTICS */}
          {/* ================================================== */}

          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Total Requests
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {loadingRequests ? "—" : requestStats.total}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiFileText size={19} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Pending
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {loadingRequests ? "—" : requestStats.pending}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FiClock size={19} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Accepted
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {loadingRequests ? "—" : requestStats.accepted}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FiCheckCircle size={19} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Completed
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {loadingRequests ? "—" : requestStats.completed}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FiCheckCircle size={19} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* CATEGORIES */}
          {/* ================================================== */}

          <section
            id="categories"
            className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                  <FiBriefcase size={13} />
                  Explore Services
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  What service do you need?
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Browse services by category and find the right professional
                  for your work.
                </p>
              </div>

              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all services
                <FiArrowRight size={16} />
              </Link>
            </div>

            {loadingCategories ? (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-200" />

                    <div className="mt-4 h-4 w-24 rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-full rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => (
                  <CategoryCard
                    key={category._id || category.id || category.name}
                    category={category}
                    onClick={handleCategoryClick}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <FiBriefcase size={28} className="mx-auto text-slate-400" />

                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  No categories available
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Search directly for the service you need.
                </p>

                <Link
                  to="/search"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <FiSearch size={14} />
                  Find Services
                </Link>
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* UPCOMING SERVICE */}
          {/* ================================================== */}

          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                  <FiCalendar size={13} />
                  Upcoming
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  Upcoming service
                </h2>
              </div>

              <Link
                to="/customer/bookings"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
              >
                View bookings
                <FiArrowRight size={16} />
              </Link>
            </div>

            {upcomingBooking ? (
              <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FiCalendar size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-emerald-600">
                        Accepted Service
                      </p>

                      <h3 className="mt-1 text-base font-black text-slate-900">
                        {getRequestServiceName(upcomingBooking)}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {getRequestProviderName(upcomingBooking)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          <FiMapPin size={11} />
                          {getRequestCity(upcomingBooking)}
                        </span>

                        {getPreferredDate(upcomingBooking) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                            <FiCalendar size={11} />
                            {getPreferredDate(upcomingBooking)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/customer/requests/${upcomingBooking._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    View Request
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FiCalendar size={21} />
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  No upcoming service
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Accepted services will appear here.
                </p>

                <Link
                  to="/search"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"
                >
                  <FiSearch size={14} />
                  Find a Service
                </Link>
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* RECENT REQUESTS */}
          {/* ================================================== */}

          <section className="border-y border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                    <FiFileText size={13} />
                    Your Activity
                  </div>

                  <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Recent service requests
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Track your latest requests and their current status.
                  </p>
                </div>

                <Link
                  to="/customer/requests"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
                >
                  View all requests
                  <FiArrowRight size={16} />
                </Link>
              </div>

              {loadingRequests ? (
                <div className="mt-8 space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-200" />

                        <div className="flex-1">
                          <div className="h-4 w-40 rounded bg-slate-200" />

                          <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
                        </div>

                        <div className="h-7 w-20 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentRequests.length > 0 ? (
                <div className="mt-8 space-y-3">
                  {recentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiBriefcase size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-slate-900">
                              {getRequestServiceName(request)}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-blue-600">
                              {getRequestProviderName(request)}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <FiMapPin size={10} />
                                {getRequestCity(request)}
                              </span>

                              <span>•</span>

                              <span>{getRequestDate(request)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${getStatusClass(
                              request.status,
                            )}`}
                          >
                            {getStatusIcon(request.status)}

                            {request.status || "Pending"}
                          </span>

                          <Link
                            to={`/customer/requests/${request._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white"
                          >
                            View
                            <FiArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <FiFileText size={24} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    No service requests yet
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Find a local professional and send your first service
                    request.
                  </p>

                  <Link
                    to="/search"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"
                  >
                    <FiSearch size={14} />
                    Find a Service
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ================================================== */}
          {/* PROVIDERS */}
          {/* ================================================== */}

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  <FiMapPin size={13} />
                  Local Providers
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Discover service providers
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Explore professionals, pricing, ratings and service
                  information.
                </p>
              </div>

              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
              >
                Explore all
                <FiArrowRight size={16} />
              </Link>
            </div>

            {loadingProviders ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProviderSkeleton key={index} />
                ))}
              </div>
            ) : providers.length > 0 ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <article
                    key={provider._id || provider.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-sm font-black text-white">
                        {provider.profileImage ? (
                          <img
                            src={provider.profileImage}
                            alt={provider.fullName || "Provider"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(provider.fullName)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-slate-900">
                              {provider.fullName || "Service Provider"}
                            </h3>

                            <p className="mt-1 truncate text-xs font-medium text-blue-600">
                              {provider.serviceName ||
                                getCategoryName(provider)}
                            </p>
                          </div>

                          {provider.isVerified && (
                            <FiCheckCircle
                              size={16}
                              className="shrink-0 text-blue-600"
                            />
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                            <FiStar size={11} fill="currentColor" />

                            {getRating(provider)}
                          </span>

                          {provider.location?.city && (
                            <span className="inline-flex items-center gap-1 truncate rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                              <FiMapPin size={10} />
                              {provider.location.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[10px] font-medium text-slate-400">
                          Starting from
                        </p>

                        <p className="mt-0.5 text-sm font-black text-slate-900">
                          Rs. {Number(provider.basePrice || 0).toLocaleString()}
                        </p>
                      </div>

                      <Link
                        to={`/provider/${provider._id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        View Profile
                        <FiArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <FiUsers size={24} className="mx-auto text-slate-400" />

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  No providers available yet
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Search for a service to discover providers.
                </p>

                <Link
                  to="/search"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"
                >
                  <FiSearch size={14} />
                  Search Services
                </Link>
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* TRUST */}
          {/* ================================================== */}

          <section className="border-y border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiUsers size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Local Professionals
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Connect with professionals around your area.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FiCheckCircle size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Verified Profiles
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review provider information before requesting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FiStar size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ratings & Reviews
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Compare providers using customer feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FiShield size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Simple & Secure
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Discover and request services easily.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* HOW IT WORKS */}
          {/* ================================================== */}

          <section className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                  <FiSend size={13} />
                  Simple Process
                </div>

                <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                  How HelpDesk works
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Get the help you need in three simple steps.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {[
                  {
                    number: "1",
                    title: "Search",
                    description:
                      "Search for the service you need and discover professionals near you.",
                  },
                  {
                    number: "2",
                    title: "Request",
                    description:
                      "Choose a provider, review their details and send your service request.",
                  },
                  {
                    number: "3",
                    title: "Get Help",
                    description:
                      "Track your request and connect with the provider for your service.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                      {step.number}
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* CTA */}
          {/* ================================================== */}

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-10">
              <div className="relative mx-auto max-w-2xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                  <FiSearch size={22} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                  Need a service today?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Search local professionals, compare their information and
                  choose the right service.
                </p>

                <Link
                  to="/search"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Find a Service
                  <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CustomerDashboard;
