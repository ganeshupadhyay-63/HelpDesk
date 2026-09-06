import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiLock,
  FiCalendar,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import api from "../../services/api";

const CustomerProfile = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get("/customer/me");

        if (response.data?.success) {
          setCustomer(response.data.customer);
        } else {
          setCustomer(response.data?.customer || response.data);
        }
      } catch (error) {
        console.error("Failed to load customer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };

  const getLocation = () => {
    const location = customer?.location;

    if (!location) return "Location not provided";

    return [
      location.address,
      location.city,
      location.district,
      location.province,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CustomerSidebar />

        <main className="lg:ml-64 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8" />

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 bg-gray-200 rounded-full" />

                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CustomerSidebar />

        <main className="lg:ml-64 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
            >
              <FiArrowLeft />
              Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <FiUser className="mx-auto text-gray-400" size={42} />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Profile not found
              </h2>
              <p className="mt-2 text-gray-500">
                Unable to load your profile information.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const fullName = customer.fullName || "Customer";
  const profileImage = customer.profileImage;

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerSidebar />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your personal information and account settings.
              </p>
            </div>

            <button
              onClick={() => navigate("/customer/profile/edit")}
              className="
                hidden sm:flex items-center gap-2
                px-4 py-2.5 rounded-xl
                bg-blue-600 text-white
                text-sm font-semibold
                hover:bg-blue-700 transition
              "
            >
              <FiEdit2 size={16} />
              Edit Profile
            </button>
          </div>

          {/* Profile Header Card */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="px-6 sm:px-8 pb-7">
              <div className="-mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div className="flex items-end gap-5">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={fullName}
                      className="
                        w-24 h-24 rounded-2xl
                        object-cover
                        border-4 border-white
                        shadow-md
                        bg-white
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-24 h-24 rounded-2xl
                        bg-blue-100 text-blue-600
                        border-4 border-white
                        shadow-md
                        flex items-center justify-center
                        text-2xl font-bold
                      "
                    >
                      {getInitials(fullName)}
                    </div>
                  )}

                  <div className="pb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {fullName}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Customer Account
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <FiCheckCircle />
                  Active Account
                </div>
              </div>

              {/* Mobile Edit */}
              <button
                onClick={() => navigate("/customer/profile/edit")}
                className="
                  sm:hidden mt-5 w-full
                  flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl
                  bg-blue-600 text-white
                  text-sm font-semibold
                  hover:bg-blue-700 transition
                "
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            </div>
          </section>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Personal Information */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Personal Information
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Your basic contact information
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiUser size={19} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <FiUser size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Full Name
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {customer.fullName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <FiMail size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Email Address
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 break-all">
                      {customer.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <FiPhone size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Phone Number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {customer.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Location</h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Your service location
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <FiMapPin size={19} />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {customer.location?.address || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      City
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {customer.location?.city || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      District
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {customer.location?.district || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Province
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {customer.location?.province || "Not provided"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-gray-400 mt-0.5" />

                    <p className="text-sm text-gray-600 leading-6">
                      {getLocation()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Information */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Account Information
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Information about your account
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FiCalendar size={19} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account Status</span>

                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>

                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email</span>

                  <span className="text-sm font-semibold text-gray-900">
                    {customer.email ? "Available" : "Not available"}
                  </span>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Security</h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Keep your account secure
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <FiLock size={19} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Password
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Change your account password
                  </p>
                </div>

                <button
                  onClick={() => navigate("/customer/change-password")}
                  className="
                    px-3 py-2 rounded-lg
                    text-sm font-semibold
                    text-blue-600
                    hover:bg-blue-50
                    transition
                  "
                >
                  Change
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Account Notice */}
          <div className="mt-6 p-5 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex gap-3">
              <FiCheckCircle className="text-blue-600 mt-0.5" size={20} />

              <div>
                <h4 className="text-sm font-semibold text-blue-900">
                  Keep your profile updated
                </h4>

                <p className="text-sm text-blue-700 mt-1">
                  Accurate contact and location information helps providers
                  reach you and deliver better service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile;
