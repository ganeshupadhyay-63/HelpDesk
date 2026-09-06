
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { loginCustomer } from "../../services/customer.api";

const CustomerLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCustomer({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response?.success || !response?.token) {
        throw new Error(
          response?.message || "Customer login failed.",
        );
      }

      localStorage.setItem("customerToken", response.token);

      if (response.customer) {
        localStorage.setItem(
          "customerUser",
          JSON.stringify(response.customer),
        );
      }

      toast.success("Login successful!");

      navigate("/customer/dashboard", { replace: true });
    } catch (error) {
      console.error("Customer Login Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
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
        </div>
      </header>

      {/* Login */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiLock size={24} />
            </div>

            {/* Heading */}
            <div className="mt-5 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to find trusted local service providers.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
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
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <FiArrowRight size={16} />}
              </button>
            </form>

            {/* Register */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/customer/register"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Provider */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Are you a service provider?{" "}
                <Link
                  to="/provider/login"
                  className="font-semibold text-slate-600 hover:text-blue-600"
                >
                  Provider Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerLogin;

