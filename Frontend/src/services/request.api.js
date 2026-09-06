import api from "./api";

export const createServiceRequest = async (data) => {
  const response = await api.post(
    "/service-request",
    data
  );

  return response.data;
};

export const getServiceRequestById = async (id) => {
  const response = await api.get(
    `/service-request/${id}`
  );

  return response.data;
};

export const cancelServiceRequest = async (id) => {
  const response = await api.put(
    `/service-request/${id}/cancel`
  );

  return response.data;
};

export const getProviderRequests = async () => {
  const response = await api.get(
    "/service-request/provider"
  );

  return response.data;
};

export const updateRequestStatus = async (
  id,
  data
) => {
  const response = await api.put(
    `/service-request/${id}/status`,
    data
  );

  return response.data;
};