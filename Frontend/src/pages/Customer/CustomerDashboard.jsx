
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiMapPin,
  FiSearch,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";

import Navbar from "../../components/customer/Navbar";
import HeroSearch from "../../components/customer/HeroSearch";
import CategoryCard from "../../components/customer/CategoryCard";
import Footer from "../../components/customer/Footer";
import api from "../../services/api";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Fetch Categories
  |--------------------------------------------------------------------------
  */

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await api.get("/category/all");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load categories",
        );
      }

      const categoryData =
        response.data?.categories ||
        response.data?.data ||
        [];

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

  /*
  |--------------------------------------------------------------------------
  | Fetch Providers
  |--------------------------------------------------------------------------
  */

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);

      /*
       * We intentionally keep this request simple.
       * The search page can handle advanced location/service filtering.
       */
      const response = await api.get("/provider/all");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load providers",
        );
      }

      const providerData =
        response.data?.providers ||
        response.data?.data ||
        [];

      setProviders(
        Array.isArray(providerData)
          ? providerData.slice(0, 6)
          : [],
      );
    } catch (error) {
      console.error("Customer Providers Error:", error);

      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProviders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Category Click
  |--------------------------------------------------------------------------
  */

  const handleCategoryClick = (category) => {
    if (!category?.name) {
      navigate("/search");
      return;
    }

    navigate(
      `/search?service=${encodeURIComponent(category.name)}`,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider helpers
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Loading Card
  |--------------------------------------------------------------------------
  */

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero / Search */}
      <HeroSearch />

      <main>
        {/* ============================================================ */}
        {/* Categories */}
        {/* ============================================================ */}

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
                Browse trusted local professionals by service
                category and find the right person for your work.
              </p>
            </div>

            <Link
              to="/search"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
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
              <FiBriefcase
                size={28}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No categories available
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Try searching directly for the service you need.
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

        {/* ============================================================ */}
        {/* Trust Banner */}
        {/* ============================================================ */}

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
                    Connect with service providers around your area.
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
                    Discover services with a clean and simple process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* Providers */}
        {/* ============================================================ */}

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
                Explore available professionals and check their
                profile, pricing, experience and service area.
              </p>
            </div>

            <Link
              to="/search"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
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
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-black text-white">
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

                    {/* Provider info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-900">
                            {provider.fullName ||
                              "Service Provider"}
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
                          <FiStar
                            size={11}
                            fill="currentColor"
                          />
                          {getRating(provider)}
                        </span>

                        {provider.location?.city && (
                          <span className="inline-flex max-w-[140px] items-center gap-1 truncate rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            <FiMapPin size={10} />
                            {provider.location.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">
                        Starting from
                      </p>

                      <p className="mt-0.5 text-sm font-black text-slate-900">
                        Rs.{" "}
                        {Number(
                          provider.basePrice || 0,
                        ).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      to={`/provider/${provider._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FiUsers size={24} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No providers available yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                Search for a service to discover providers
                available on HelpDesk.
              </p>

              <Link
                to="/search"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                <FiSearch size={14} />
                Search Services
              </Link>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* CTA */}
        {/* ============================================================ */}

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-6 py-12 text-center sm:px-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                <FiSearch size={22} />
              </div>

              <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                Need a service today?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Search local professionals, compare their
                information and choose the right service for your
                needs.
              </p>

              <Link
                to="/search"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                Find a Service
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerDashboard;

