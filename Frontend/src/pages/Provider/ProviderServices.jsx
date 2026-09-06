import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEdit2,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { getActiveCategories } from "../../services/category.api";

import {
  createService,
  deleteService,
  getMyServices,
  updateService,
  updateServiceAvailability,
} from "../../services/service.api";

/* =========================================================
   CONSTANTS
========================================================= */

const PRICE_UNITS = [
  { value: "service", label: "Per service" },
  { value: "visit", label: "Per visit" },
  { value: "hour", label: "Per hour" },
  { value: "day", label: "Per day" },
  { value: "trip", label: "Per trip" },
  { value: "custom", label: "Custom" },
];

const emptyForm = {
  name: "",
  category: "",
  description: "",
  basePrice: "",
  priceUnit: "service",
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProviderServices = () => {
  const { provider, logout } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  /* =======================================================
     FETCH SERVICES
  ======================================================= */

  const fetchServices = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getMyServices();

      if (!data?.success) {
        throw new Error(data?.message || "Unable to load your services.");
      }

      setServices(normalizeServices(data));
    } catch (err) {
      console.error("Services loading error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to load services.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     FETCH CATEGORIES
  ======================================================= */

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getActiveCategories();

      if (data?.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Category loading error:", err);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  /* =======================================================
     FILTER SERVICES
  ======================================================= */

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        getCategoryName(service).toLowerCase().includes(query);

      const active = isServiceActive(service);
      const available = isServiceAvailable(service);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && active) ||
        (filter === "inactive" && !active) ||
        (filter === "available" && available) ||
        (filter === "unavailable" && !available);

      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const statistics = useMemo(() => {
    const active = services.filter(isServiceActive).length;
    const available = services.filter(isServiceAvailable).length;

    return {
      total: services.length,
      active,
      inactive: services.length - active,
      available,
      unavailable: services.length - available,
    };
  }, [services]);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleOpenEdit = (service) => {
    setEditingService(service);

    setFormData({
      name: service.name || "",
      category: service.category?._id || service.category || "",
      description: service.description || "",
      basePrice:
        service.basePrice !== undefined && service.basePrice !== null
          ? service.basePrice
          : "",
      priceUnit: service.priceUnit || "service",
    });

    setShowForm(true);
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter a service name.";
    }

    if (formData.name.trim().length < 2) {
      return "Service name must contain at least 2 characters.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (
      formData.basePrice === "" ||
      Number.isNaN(Number(formData.basePrice)) ||
      Number(formData.basePrice) < 0
    ) {
      return "Please enter a valid base price.";
    }

    if (!formData.description.trim()) {
      return "Please enter a service description.";
    }

    return null;
  };

  /* =======================================================
     SAVE SERVICE
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      basePrice: Number(formData.basePrice),
      priceUnit: formData.priceUnit,
    };

    try {
      setSaving(true);

      if (editingService) {
        const data = await updateService(editingService._id, payload);

        if (!data?.success) {
          throw new Error(data?.message || "Unable to update service.");
        }

        toast.success("Service updated successfully.");
      } else {
        const data = await createService(payload);

        if (!data?.success) {
          throw new Error(data?.message || "Unable to create service.");
        }

        toast.success("Service created successfully.");
      }

      closeForm();

      await fetchServices(true);
    } catch (err) {
      console.error("Service save error:", err);

      toast.error(
        err.response?.data?.message || err.message || "Unable to save service.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingService(null);
    setFormData(emptyForm);
  };

  /* =======================================================
     TOGGLE AVAILABILITY
  ======================================================= */

  const handleToggleAvailability = async (service) => {
    try {
      const newAvailability = !isServiceAvailable(service);

      const data = await updateServiceAvailability(service._id, {
        available: newAvailability,
      });

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to update service availability.",
        );
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? {
                ...item,
                available: newAvailability,
                isAvailable: newAvailability,
              }
            : item,
        ),
      );

      toast.success(
        newAvailability
          ? "Service is now available."
          : "Service is now unavailable.",
      );
    } catch (err) {
      console.error("Availability update error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to update availability.",
      );
    }
  };

  /* =======================================================
     TOGGLE ACTIVE
  ======================================================= */

  const handleToggleActive = async (service) => {
    try {
      const newActive = !isServiceActive(service);

      const data = await updateService(service._id, {
        active: newActive,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Unable to update service.");
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? {
                ...item,
                active: newActive,
              }
            : item,
        ),
      );

      toast.success(newActive ? "Service activated." : "Service deactivated.");
    } catch (err) {
      console.error("Active status update error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to update service.",
      );
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const data = await deleteService(deleteTarget._id);

      if (!data?.success) {
        throw new Error(data?.message || "Unable to delete service.");
      }

      setServices((prev) =>
        prev.filter((item) => item._id !== deleteTarget._id),
      );

      setDeleteTarget(null);

      toast.success("Service deleted successfully.");
    } catch (err) {
      console.error("Service delete error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete service.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <PageLoading />;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileMenu && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64
          flex-col border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FiSearch size={18} />
            </div>

            <span className="text-lg font-bold text-slate-900">
              Help
              <span className="text-blue-600">Desk</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Provider mini profile */}
        <Link
          to="/provider/profile"
          onClick={() => setMobileMenu(false)}
          className="border-b border-slate-100 p-4"
        >
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50">
            <ProviderAvatar provider={provider} />

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {provider?.fullName || "Provider"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {provider?.serviceName || "Service Provider"}
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavItem
            icon={FiGrid}
            label="Dashboard"
            to="/provider/dashboard"
            onNavigate={() => setMobileMenu(false)}
          />

          <NavItem
            icon={FiBriefcase}
            label="My Services"
            to="/provider/services"
            active
            onNavigate={() => setMobileMenu(false)}
          />

          <NavItem
            icon={FiActivity}
            label="Service Requests"
            to="/provider/requests"
            onNavigate={() => setMobileMenu(false)}
          />

          <NavItem
            icon={FiClock}
            label="Bookings"
            onClick={() =>
              toast.info("Bookings module will be available soon.")
            }
          />

          <NavItem
            icon={FiUser}
            label="My Profile"
            to="/provider/profile"
            onNavigate={() => setMobileMenu(false)}
          />

          <div className="my-4 border-t border-slate-100" />

          <NavItem
            icon={FiSettings}
            label="Settings"
            onClick={() =>
              toast.info("Settings module will be available soon.")
            }
          />
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-4">
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

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenu(true)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <FiMenu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Provider Portal
                </p>

                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  My Services
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => fetchServices(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
                title="Refresh services"
              >
                <FiRefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <Link to="/provider/profile">
                <ProviderAvatar provider={provider} small />
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="mb-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Link
                  to="/provider/dashboard"
                  className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  <FiArrowLeft size={14} />
                  Back to dashboard
                </Link>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Manage your services
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Add, update and manage the services customers can discover
                  through HelpDesk.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              >
                <FiPlus size={18} />
                Add Service
              </button>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <FiAlertCircle
                  className="mt-0.5 shrink-0 text-red-500"
                  size={20}
                />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Unable to load services
                  </p>

                  <p className="mt-1 text-xs text-red-600">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchServices()}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Services"
              value={statistics.total}
              icon={FiBriefcase}
              description="Services you've created"
            />

            <SummaryCard
              title="Active Services"
              value={statistics.active}
              icon={FiCheck}
              description="Visible to customers"
            />

            <SummaryCard
              title="Available Now"
              value={statistics.available}
              icon={FiActivity}
              description="Currently accepting work"
            />

            <SummaryCard
              title="Inactive"
              value={statistics.inactive}
              icon={FiXCircle}
              description="Currently hidden"
            />
          </section>

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  count={statistics.total}
                >
                  All
                </FilterButton>

                <FilterButton
                  active={filter === "active"}
                  onClick={() => setFilter("active")}
                  count={statistics.active}
                >
                  Active
                </FilterButton>

                <FilterButton
                  active={filter === "inactive"}
                  onClick={() => setFilter("inactive")}
                  count={statistics.inactive}
                >
                  Inactive
                </FilterButton>

                <FilterButton
                  active={filter === "available"}
                  onClick={() => setFilter("available")}
                  count={statistics.available}
                >
                  Available
                </FilterButton>

                <FilterButton
                  active={filter === "unavailable"}
                  onClick={() => setFilter("unavailable")}
                  count={statistics.unavailable}
                >
                  Unavailable
                </FilterButton>
              </div>
            </div>
          </section>

          {/* =================================================
              RESULT INFO
          ================================================= */}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "service" : "services"}
            </p>

            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* =================================================
              SERVICES
          ================================================= */}

          <section className="mt-4">
            {filteredServices.length === 0 ? (
              <EmptyServices
                hasServices={services.length > 0}
                onAdd={handleOpenCreate}
                onClear={() => {
                  setSearch("");
                  setFilter("all");
                }}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onEdit={() => handleOpenEdit(service)}
                    onDelete={() => setDeleteTarget(service)}
                    onToggleAvailability={() =>
                      handleToggleAvailability(service)
                    }
                    onToggleActive={() => handleToggleActive(service)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* =====================================================
          SERVICE FORM
      ===================================================== */}

      {showForm && (
        <ServiceFormModal
          editing={editingService}
          formData={formData}
          categories={categories}
          saving={saving}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <DeleteModal
          service={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

/* =========================================================
   SERVICE CARD
========================================================= */

const ServiceCard = ({
  service,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleActive,
}) => {
  const active = isServiceActive(service);
  const available = isServiceAvailable(service);

  const categoryName = getCategoryName(service);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      {/* Top */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <FiBriefcase size={21} />
            </div>

            <div className="min-w-0">
              <h3
                className="truncate text-base font-bold text-slate-900"
                title={service.name}
              >
                {service.name || "Unnamed service"}
              </h3>

              <p className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-slate-500">
                <FiGrid size={12} />
                {categoryName}
              </p>
            </div>
          </div>

          <StatusBadge active={active} />
        </div>

        <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
          {service.description || "No description provided."}
        </p>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 border-b border-slate-100">
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Base Price
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            Rs. {Number(service.basePrice || 0).toLocaleString()}
          </p>
        </div>

        <div className="border-l border-slate-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Price Unit
          </p>

          <p className="mt-1 text-sm font-bold capitalize text-slate-700">
            {formatPriceUnit(service.priceUnit)}
          </p>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                available ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />

            <p className="text-sm font-semibold text-slate-700">
              {available ? "Available now" : "Unavailable"}
            </p>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            {available
              ? "Customers can request this service."
              : "Customers cannot request this service."}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAvailability}
          aria-label={
            available ? "Make service unavailable" : "Make service available"
          }
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            available ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              available ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <FiEdit2 size={14} />
          Edit
        </button>

        <button
          type="button"
          onClick={onToggleActive}
          title={active ? "Deactivate service" : "Activate service"}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
            active
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {active ? "Off" : "On"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Delete service"
          className="rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </article>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ active }) => {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

/* =========================================================
   SERVICE FORM MODAL
========================================================= */

const ServiceFormModal = ({
  editing,
  formData,
  categories,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Provider Service
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {editing ? "Edit service" : "Add new service"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {editing
                ? "Update your service information."
                : "Create a service customers can discover."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="max-h-[78vh] overflow-y-auto p-6 sm:p-7"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Service name"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="e.g. House Wiring"
              icon={<FiBriefcase />}
              required
            />

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={onChange}
              categories={categories}
              required
            />

            <InputField
              label="Base price"
              name="basePrice"
              type="number"
              min="0"
              value={formData.basePrice}
              onChange={onChange}
              placeholder="e.g. 1500"
              icon={<span className="text-xs font-bold">Rs.</span>}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Price unit
              </label>

              <div className="relative">
                <select
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={onChange}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {PRICE_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={1000}
                value={formData.description}
                onChange={onChange}
                placeholder="Describe what this service includes..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <div className="mt-1 text-right text-xs text-slate-400">
                {formData.description.length}/1000
              </div>
            </div>
          </div>

          {/* Location info */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <FiMapPin className="mt-0.5 shrink-0 text-blue-600" />

              <div>
                <p className="text-xs font-bold text-blue-800">
                  Location-based service
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Your service will use your provider location. Nearby customers
                  can discover this service based on your location, service
                  radius and availability.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  {editing ? "Update service" : "Create service"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   DELETE MODAL
========================================================= */

const DeleteModal = ({ service, deleting, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <FiTrash2 size={21} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Delete service?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <strong className="text-slate-700">{service.name}</strong>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 size={15} />
                Delete service
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({ title, value, icon: Icon, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   INPUT
========================================================= */

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
          required={required}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            icon ? "pl-11 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

/* =========================================================
   SELECT
========================================================= */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  categories,
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

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <FiChevronDown
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
      </div>
    </div>
  );
};

/* =========================================================
   FILTER BUTTON
========================================================= */

const FilterButton = ({ active, onClick, children, count }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {children}

      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
          active ? "bg-white/20 text-white" : "bg-white text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

/* =========================================================
   NAV ITEM
========================================================= */

const NavItem = ({
  icon: Icon,
  label,
  to,
  active = false,
  onClick,
  onNavigate,
}) => {
  const className = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
    active
      ? "bg-blue-50 text-blue-700"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
  }`;

  const content = (
    <>
      <Icon size={18} />
      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onNavigate} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyServices = ({ hasServices, onAdd, onClear }) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        {hasServices ? <FiSearch size={24} /> : <FiBriefcase size={24} />}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {hasServices ? "No matching services" : "No services yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasServices
          ? "Try changing your search or filter."
          : "Create your first service so customers can discover what you offer."}
      </p>

      {hasServices ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
        >
          <FiPlus size={16} />
          Add your first service
        </button>
      )}
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const ProviderAvatar = ({ provider, small = false }) => {
  const image = provider?.profileImage;
  const name = provider?.fullName || "Provider";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${
          small ? "h-9 w-9" : "h-10 w-10"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${
        small ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {getInitials(name)}
    </div>
  );
};

/* =========================================================
   LOADING
========================================================= */

const PageLoading = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading your services...
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeServices = (data) => {
  if (Array.isArray(data?.services)) {
    return data.services;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

/*
  Supports both possible backend/frontend naming:
  available
  isAvailable

  This fixes the inconsistency in the previous component.
*/

const isServiceAvailable = (service) => {
  if (typeof service?.available === "boolean") {
    return service.available;
  }

  if (typeof service?.isAvailable === "boolean") {
    return service.isAvailable;
  }

  return false;
};

const isServiceActive = (service) => {
  return service?.active !== false;
};

const getCategoryName = (service) => {
  if (typeof service?.category === "object") {
    return service.category?.name || "Service";
  }

  return service?.categoryName || "Service";
};

const formatPriceUnit = (unit) => {
  const found = PRICE_UNITS.find((item) => item.value === unit);

  return found?.label || "Per service";
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

export default ProviderServices;
