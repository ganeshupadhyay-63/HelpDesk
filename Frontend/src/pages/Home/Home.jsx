import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";

import Navbar from "../../components/customer/Navbar";
import HeroSearch from "../../components/customer/HeroSearch";
import CategoryCard from "../../components/customer/CategoryCard";
import Footer from "../../components/customer/Footer";

import { getActiveCategories } from "../../services/category.api";

const fallbackCategories = [
  {
    _id: "electrician",
    name: "Electrician",
    description: "Wiring, repair and installation",
  },
  {
    _id: "plumber",
    name: "Plumber",
    description: "Pipe, water and plumbing services",
  },
  {
    _id: "mechanic",
    name: "Mechanic",
    description: "Bike, car and vehicle repair",
  },
  {
    _id: "carpenter",
    name: "Carpenter",
    description: "Furniture and woodwork services",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await getActiveCategories();

        if (data?.success) {
          setCategories(data.categories || []);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);

        setCategories(fallbackCategories);

        toast.error("Unable to load latest categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CATEGORY CLICK
  |--------------------------------------------------------------------------
  | User selects a service/category from homepage.
  | First choose Customer or Provider.
  |
  | Example:
  | /choose-role?category=64abc123
  */
  const handleCategoryClick = (category) => {
    if (!category?._id) return;

    navigate(`/choose-role?category=${encodeURIComponent(category._id)}`);
  };

  /*
  |--------------------------------------------------------------------------
  | FIND SERVICE
  |--------------------------------------------------------------------------
  */
  const handleFindService = () => {
    navigate("/choose-role");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* ================================================================
            HERO
        ================================================================ */}
        <HeroSearch />

        {/* ================================================================
            CATEGORIES
        ================================================================ */}
        <section
          id="categories"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Explore services
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                What service do you need?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Choose a service and connect with skilled local professionals.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFindService}
              className="group flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View all services
              <FiArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Loading */}
          {loadingCategories ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />

                  <div className="mt-4 h-4 w-24 rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-full rounded bg-slate-100" />

                  <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            /* Categories */
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FiSearch className="mx-auto text-slate-400" size={28} />

              <h3 className="mt-3 font-semibold text-slate-900">
                No categories available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Please check again later.
              </p>

              <button
                type="button"
                onClick={handleFindService}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse services
                <FiArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* ================================================================
            HOW IT WORKS
        ================================================================ */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Simple process
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Get help in three simple steps
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Finding the right professional through HelpDesk is simple.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiSearch size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  1. Find a Service
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select the service you need from our available categories.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiUsers size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  2. Choose a Provider
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Compare local professionals, services, prices and ratings.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <FiCheckCircle size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  3. Request Service
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Send your request and connect directly with your selected
                  professional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            WHY HELPDESK
        ================================================================ */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-blue-600 px-6 py-10 sm:px-10 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              {/* Content */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                  Why HelpDesk?
                </p>

                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Local help, whenever you need it.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
                  Discover local professionals, compare their services and
                  choose the right person for your needs.
                </p>

                <button
                  type="button"
                  onClick={handleFindService}
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Find a service
                  <FiArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {/* Nearby */}
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <FiMapPin className="text-blue-100" size={24} />

                  <h3 className="mt-4 font-bold text-white">Nearby</h3>

                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    Discover professionals available in your local area.
                  </p>
                </div>

                {/* Trusted */}
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <FiShield className="text-blue-100" size={24} />

                  <h3 className="mt-4 font-bold text-white">Trusted</h3>

                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    Review provider information before making a request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FINAL CTA
        ================================================================ */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Choose a service and continue as a customer or provider.
            </p>

            <button
              type="button"
              onClick={handleFindService}
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Explore Services
              <FiArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
