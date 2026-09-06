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

  const handleCategoryClick = (category) => {
    if (!category?._id) return;

    navigate(`/search?category=${encodeURIComponent(category._id)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <HeroSearch />

        {/* Categories */}
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
                Browse popular categories and find skilled professionals near
                your location.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all services
              <FiArrowRight size={16} />
            </button>
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

                  <div className="mt-2 h-3 w-full rounded bg-slate-100" />

                  <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
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
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FiSearch className="mx-auto text-slate-400" size={28} />

              <h3 className="mt-3 font-semibold text-slate-900">
                No categories available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Please check again later.
              </p>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Simple process
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Get help in three simple steps
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiSearch size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">1. Search</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Search for the service you need and select your location.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiUsers size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">2. Choose</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Compare nearby providers, services, prices and ratings.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <FiCheckCircle size={24} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">3. Request</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Send your service request directly to the selected
                  professional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-blue-600 px-6 py-10 sm:px-10 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                  Why HelpDesk?
                </p>

                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Local help, whenever you need it.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
                  Connect with local professionals based on your location. No
                  customer account is required to request a service.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Find a service
                  <FiArrowRight size={17} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <FiMapPin className="text-blue-100" size={24} />

                  <h3 className="mt-4 font-bold text-white">Nearby</h3>

                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    Find professionals based on your location.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <FiShield className="text-blue-100" size={24} />

                  <h3 className="mt-4 font-bold text-white">Trusted</h3>

                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    View provider information before requesting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
