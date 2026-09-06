import api from "./api";

export const searchNearbyServices = async (params) => {
  const response = await api.get("/search/nearby", {
    params,
  });

  return response.data;
};