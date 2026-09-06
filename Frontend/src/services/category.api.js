import api from "./api";

export const getCategories = async () => {
  const response = await api.get("/category");
  return response.data;
};

export const getActiveCategories = async () => {
  const response = await api.get("/category/active");
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/category/${id}`);
  return response.data;
};