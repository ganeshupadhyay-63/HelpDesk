import api from "./api";

export const registerCustomer = async (data) => {
  const response = await api.post("/customer/register", data);

  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await api.post("/customer/login", data);

  return response.data;
};

export const getCurrentCustomer = async () => {
  const response = await api.get("/customer/me");

  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/customer/logout");

  return response.data;
};
