import { Navigate, Outlet } from "react-router-dom";

const ProtectedCustomer = () => {
  const token = localStorage.getItem("customerToken");

  if (!token) {
    return <Navigate to="/customer/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedCustomer;