import { Navigate, Route, Routes } from "react-router-dom";

// Protected Route
import ProtectedProviderRoute from "./components/provider/ProtectedProviderRoute";

// ====================
// Customer Pages
// ====================
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import ServiceDetails from "./pages/Service/ServiceDetails";
import RequestService from "./pages/Request/RequestService";
import RequestStatus from "./pages/Request/RequestStatus";

// Provider Details
import ProviderDetails from "./components/customer/ProviderDetails";

import CustomerRegister from "./pages/Customer/CustomerRegister";
import CustomerLogin from "./pages/Customer/CustomerLogin";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProtectedCustomer from "./components/customer/ProtectedCustomer";
import CustomerProfile from "./pages/Customer/CustomerProfile";

// roleselection
import RoleSelection from "./pages/RoleSelection/RoleSelection";

// ====================
// Provider Authentication
// ====================
import ProviderLogin from "./pages/Provider/ProviderLogin";
import ProviderRegister from "./pages/Provider/ProviderRegister";

// ====================
// Provider Pages
// ====================
import ProviderDashboard from "./pages/Provider/ProviderDashboard";
import ProviderServices from "./pages/Provider/ProviderServices";
import ProviderRequests from "./pages/Provider/ProviderRequests";
import ProviderProfile from "./pages/Provider/ProviderProfile";

function App() {
  return (
    <Routes>
      {/* =====================================================
          CUSTOMER ROUTES
      ====================================================== */}

      {/* Home */}
      <Route path="/" element={<Home />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />

      {/* Search */}
      <Route path="/search" element={<Search />} />
      <Route path="/provider/:providerId" element={<ProviderDetails />} />

      {/* Service Details */}
      <Route path="/service/:id" element={<ServiceDetails />} />

      {/* Request Service */}
      <Route path="/request/:id" element={<RequestService />} />

      {/* Request Status */}
      <Route path="/request/status/:id" element={<RequestStatus />} />

      {/* =====================================================
          PROVIDER AUTHENTICATION ROUTES
      ====================================================== */}

      {/* role selection */}
      <Route path="/choose-role" element={<RoleSelection />} />

      {/* Provider Login */}
      <Route path="/provider/login" element={<ProviderLogin />} />

      {/* Provider Registration */}
      <Route path="/provider/register" element={<ProviderRegister />} />

      {/* =====================================================
          PROTECTED PROVIDER ROUTES
          All these pages require provider authentication.
      ====================================================== */}

      <Route element={<ProtectedProviderRoute />}>
        {/* Dashboard */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />

        {/* Services */}
        <Route path="/provider/services" element={<ProviderServices />} />

        {/* Requests */}
        <Route path="/provider/requests" element={<ProviderRequests />} />

        {/* Profile */}
        <Route path="/provider/profile" element={<ProviderProfile />} />
      </Route>

      <Route element={<ProtectedCustomer />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      </Route>

      {/* =====================================================
          FALLBACK ROUTE
      ====================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
