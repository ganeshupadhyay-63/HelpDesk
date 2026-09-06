import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiClipboard,
  FiCalendar,
  FiHeart,
  FiMessageCircle,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";

const menuItems = [
  {
    label: "Dashboard",
    path: "/customer/dashboard",
    icon: FiHome,
  },
  {
    label: "Services",
    path: "/search",
    icon: FiSearch,
  },
  {
    label: "My Requests",
    path: "/customer/requests",
    icon: FiClipboard,
  },
  {
    label: "My Bookings",
    path: "/customer/bookings",
    icon: FiCalendar,
  },
  {
    label: "Saved Providers",
    path: "/customer/saved",
    icon: FiHeart,
  },
  {
    label: "Messages",
    path: "/customer/messages",
    icon: FiMessageCircle,
  },
  {
    label: "Notifications",
    path: "/customer/notifications",
    icon: FiBell,
  },
];

const accountItems = [
  {
    label: "Profile",
    path: "/customer/profile",
    icon: FiUser,
  },
  {
    label: "Settings",
    path: "/customer/settings",
    icon: FiSettings,
  },
];

const CustomerSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");

    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              H
            </div>

            <span className="text-xl font-bold text-gray-900">
              Help<span className="text-blue-600">Desk</span>
            </span>
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    `
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Account */}
          <p className="px-3 mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Account
          </p>

          <nav className="space-y-1">
            {accountItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    `
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3
              px-3 py-3 rounded-xl
              text-sm font-medium text-red-600
              hover:bg-red-50 transition
            "
          >
            <FiLogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
