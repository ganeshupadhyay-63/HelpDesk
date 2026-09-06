import api from "./api";

export const getMyServices = async () => {
  const response = await api.get("/service/my-services");
  return response.data;
};

export const getAllServices = async () => {
  const response = await api.get("/service/all");
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await api.get(`/service/${id}`);
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post("/service", data);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.put(`/service/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/service/${id}`);
  return response.data;
};

export const updateServiceAvailability = async (id, data) => {
  const response = await api.put(`/service/${id}/availability`, data);
  return response.data;
};
