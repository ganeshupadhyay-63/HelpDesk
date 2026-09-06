import { Link } from "react-router-dom";
import { FiMenu, FiSearch, FiUser, FiX } from "react-icons/fi";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className="text-sm font-medium text-blue-600">
            Home
          </Link>

          <Link
            to="/search"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Find Services
          </Link>

          <a
            href="#categories"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Categories
          </a>

          {/* Customer */}
          <Link
            to="/customer/dashboard"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Customer
          </Link>

          {/* Provider Login */}
          <Link
            to="/provider/login"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Provider Login
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Link
          to="/provider/register"
          className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 md:flex"
        >
          <FiUser size={16} />
          Become a Provider
        </Link>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={closeMobile}
              className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600"
            >
              Home
            </Link>

            <Link
              to="/search"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Find Services
            </Link>

            <a
              href="#categories"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Categories
            </a>

            {/* Customer */}
            <Link
              to="/customer/dashboard"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Customer Dashboard
            </Link>

            {/* Provider Login */}
            <Link
              to="/provider/login"
              onClick={closeMobile}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Provider Login
            </Link>

            {/* Become Provider */}
            <Link
              to="/provider/register"
              onClick={closeMobile}
              className="mt-2 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
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
