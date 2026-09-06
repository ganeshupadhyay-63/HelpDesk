
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiUser,
  FiX,
  FiLogOut,
  FiUserCheck,
} from "react-icons/fi";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const customerToken = localStorage.getItem("customerToken");

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");

    closeMobile();
    navigate("/customer/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            LOGO
        ====================================================== */}
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={closeMobile}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FiSearch size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold leading-none text-slate-900">
              Help<span className="text-blue-600">Desk</span>
            </h1>

            <p className="mt-1 hidden text-[10px] font-medium text-slate-500 sm:block">
              Local services, made easy
            </p>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <nav className="hidden items-center gap-7 md:flex">
          {/* Home */}
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Home
          </Link>

          {/* Find Services */}
          <Link
            to="/search"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Find Services
          </Link>

          {/* Categories */}
          <a
            href="#categories"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Categories
          </a>

          {/* =================================================
              CUSTOMER LOGGED IN
          ================================================== */}
          {customerToken ? (
            <>
              {/* Dashboard */}
              <Link
                to="/customer/dashboard"
                className="text-sm font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              {/* Profile */}
              <Link
                to="/customer/profile"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <FiUserCheck size={16} />
                Profile
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-red-600"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Customer Login */}
              <Link
                to="/customer/login"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Customer Login
              </Link>

              {/* Provider Login */}
              <Link
                to="/provider/login"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Provider Login
              </Link>
            </>
          )}
        </nav>

        {/* =====================================================
            DESKTOP ROLE BUTTONS
        ====================================================== */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Become Customer */}
          <Link
            to="/customer/register"
            className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Become a Customer
          </Link>

          {/* Become Provider */}
          <Link
            to="/provider/register"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiUser size={16} />
            Become a Provider
          </Link>
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <nav className="flex flex-col gap-1">
            {/* Home */}
            <Link
              to="/"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </Link>

            {/* Find Services */}
            <Link
              to="/search"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Find Services
            </Link>

            {/* Categories */}
            <a
              href="#categories"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Categories
            </a>

            {/* =================================================
                CUSTOMER LOGGED IN
            ================================================== */}
            {customerToken ? (
              <>
                {/* Dashboard */}
                <Link
                  to="/customer/dashboard"
                  onClick={closeMobile}
                  className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600"
                >
                  Customer Dashboard
                </Link>

                {/* Profile */}
                <Link
                  to="/customer/profile"
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Profile
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <FiLogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Customer Login */}
                <Link
                  to="/customer/login"
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Customer Login
                </Link>

                {/* Provider Login */}
                <Link
                  to="/provider/login"
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Provider Login
                </Link>
              </>
            )}

            {/* =================================================
                ROLE REGISTRATION BUTTONS
            ================================================== */}

            {/* Become Customer */}
            <Link
              to="/customer/register"
              onClick={closeMobile}
              className="mt-2 rounded-xl border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Become a Customer
            </Link>

            {/* Become Provider */}
            <Link
              to="/provider/register"
              onClick={closeMobile}
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Become a Provider
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
