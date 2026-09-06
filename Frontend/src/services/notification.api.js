import api from "./api";

/*
|--------------------------------------------------------------------------
| Get Provider Notifications
|--------------------------------------------------------------------------
*/
export const getProviderNotifications = async () => {
  const response = await api.get("/notification/provider");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Unread Notification Count
|--------------------------------------------------------------------------
*/
export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notification/provider/unread-count");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Mark One Notification As Read
|--------------------------------------------------------------------------
*/
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/notification/${notificationId}/read`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Mark All Notifications As Read
|--------------------------------------------------------------------------
*/
export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/notification/provider/read-all");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notification/${notificationId}`);

  return response.data;
};
