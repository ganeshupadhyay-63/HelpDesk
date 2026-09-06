import api from "./api";

export const registerProvider = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginProvider = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getCurrentProvider = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutProvider = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};