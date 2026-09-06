import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

const ProviderLogin = () => {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/provider/dashboard", {
        replace: true,
      });
    }
  }, [
    authLoading,
    isAuthenticated,
    navigate,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      toast.error(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setSubmitting(true);

      await login({
        email,
        password,
      });

      toast.success(
        "Login successful. Welcome back!"
      );

      navigate("/provider/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Provider login error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left branding section */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">

            <Link
              to="/"
              className="flex w-fit items-center gap-2.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FiSearch size={22} />
              </div>

              <span className="text-2xl font-bold text-white">
                Help<span className="text-blue-400">
                  Desk
                </span>
              </span>
            </Link>

            <div className="max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Provider Portal
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Grow your local service business with HelpDesk.
              </h1>

              <p className="mt-6 text-base leading-7 text-slate-400">
                Connect with customers looking for trusted
                professionals near them. Manage your services,
                requests and availability from one place.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <FiShield className="text-blue-400" />
                  Manage your service professionally
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <FiSearch className="text-blue-400" />
                  Reach customers near your location
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} HelpDesk
            </p>
          </div>
        </div>

        {/* Right login section */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FiSearch size={20} />
                </div>

                <span className="text-xl font-bold text-slate-900">
                  Help<span className="text-blue-600">
                    Desk
                  </span>
                </span>
              </Link>
            </div>

            {/* Back */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft size={16} />
              Back to HelpDesk
            </Link>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Provider Login
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to manage your services and customer
                requests.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have a provider account?
              </p>

              <Link
                to="/provider/register"
                className="mt-2 inline-block text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Create your provider account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;