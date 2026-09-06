import { useCallback, useEffect, useRef, useState } from "react";

import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTrash2,
  FiXCircle,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  deleteNotification,
  getProviderNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notification.api";

/*
|--------------------------------------------------------------------------
| Notification Type Configuration
|--------------------------------------------------------------------------
*/
const getNotificationConfig = (type) => {
  switch (type) {
    case "NEW_REQUEST":
      return {
        icon: FiActivity,
        label: "New Request",
      };

    case "REQUEST_ACCEPTED":
      return {
        icon: FiCheckCircle,
        label: "Request Accepted",
      };

    case "REQUEST_REJECTED":
      return {
        icon: FiXCircle,
        label: "Request Rejected",
      };

    case "REQUEST_CANCELLED":
      return {
        icon: FiAlertCircle,
        label: "Request Cancelled",
      };

    case "REQUEST_COMPLETED":
      return {
        icon: FiCheckCircle,
        label: "Request Completed",
      };

    case "PROVIDER_MESSAGE":
      return {
        icon: FiActivity,
        label: "Provider Message",
      };

    default:
      return {
        icon: FiBell,
        label: "Notification",
      };
  }
};

/*
|--------------------------------------------------------------------------
| Relative Time
|--------------------------------------------------------------------------
*/
const formatRelativeTime = (date) => {
  if (!date) {
    return "";
  }

  const now = Date.now();
  const created = new Date(date).getTime();

  if (!Number.isFinite(created)) {
    return "";
  }

  const difference = Math.max(0, now - created);

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Notification Bell
|--------------------------------------------------------------------------
*/
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [open, setOpen] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const dropdownRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  */
  const fetchNotifications = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getProviderNotifications();

      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch notifications");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );

      setUnreadCount(Number(data.unreadCount) || 0);
    } catch (error) {
      console.error("Fetch notifications error:", error);

      if (showLoader) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to refresh notifications",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const token = localStorage.getItem("providerToken");

    if (!token) {
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Refresh While Dashboard Is Open
  |--------------------------------------------------------------------------
  |
  | Since we are not using WebSocket yet, polling keeps
  | notifications reasonably fresh.
  |
  */
  useEffect(() => {
    const token = localStorage.getItem("providerToken");

    if (!token) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Close Dropdown When Clicking Outside
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Mark One As Read
  |--------------------------------------------------------------------------
  */
  const handleMarkAsRead = async (notification) => {
    if (!notification?._id || notification.isRead) {
      return;
    }

    try {
      setProcessingId(notification._id);

      const data = await markNotificationAsRead(notification._id);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to mark notification as read");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Mark notification read error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to mark notification as read",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Mark All As Read
  |--------------------------------------------------------------------------
  */
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setRefreshing(true);

      const data = await markAllNotificationsAsRead();

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to mark all notifications as read",
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all notifications error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update notifications",
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Notification
  |--------------------------------------------------------------------------
  */
  const handleDelete = async (notification) => {
    if (!notification?._id) {
      return;
    }

    try {
      setProcessingId(notification._id);

      const wasUnread = !notification.isRead;

      const data = await deleteNotification(notification._id);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete notification");
      }

      setNotifications((previous) =>
        previous.filter((item) => item._id !== notification._id),
      );

      if (wasUnread) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Delete notification error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to delete notification",
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Handle Notification Click
  |--------------------------------------------------------------------------
  */
  const handleNotificationClick = async (notification) => {
    await handleMarkAsRead(notification);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ==================================================
          Bell Button
      ================================================== */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="
          relative flex h-10 w-10 items-center
          justify-center rounded-xl border
          border-slate-200 bg-white text-slate-600
          transition hover:border-slate-300
          hover:bg-slate-50 hover:text-slate-900
          focus:outline-none focus:ring-2
          focus:ring-blue-500/20
        "
      >
        <FiBell size={19} />

        {unreadCount > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              flex min-h-[20px] min-w-[20px]
              items-center justify-center
              rounded-full border-2 border-white
              bg-red-500 px-1 text-[10px]
              font-bold text-white
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ==================================================
          Dropdown
      ================================================== */}
      {open && (
        <div
          className="
            absolute right-0 top-12 z-50
            w-[calc(100vw-2rem)] max-w-[420px]
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white shadow-2xl
            shadow-slate-900/10
          "
        >
          {/* ==================================================
              Header
          ================================================== */}
          <div
            className="
              flex items-center justify-between
              border-b border-slate-100
              px-4 py-3
            "
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchNotifications(true)}
                disabled={refreshing}
                title="Refresh"
                className="
                  flex h-8 w-8 items-center
                  justify-center rounded-lg
                  text-slate-500
                  transition hover:bg-slate-100
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <FiRefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={refreshing}
                  title="Mark all as read"
                  className="
                    flex h-8 w-8 items-center
                    justify-center rounded-lg
                    text-slate-500
                    transition hover:bg-slate-100
                    hover:text-blue-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <FiCheck size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              Content
          ================================================== */}
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="text-center">
                  <div
                    className="
                      mx-auto h-8 w-8
                      animate-spin rounded-full
                      border-4 border-slate-200
                      border-t-blue-600
                    "
                  />

                  <p className="mt-3 text-xs text-slate-500">
                    Loading notifications...
                  </p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div
                  className="
                    mx-auto flex h-14 w-14
                    items-center justify-center
                    rounded-2xl bg-slate-100
                    text-slate-400
                  "
                >
                  <FiBell size={24} />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  No notifications
                </h4>

                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-slate-500">
                  New service requests and updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = getNotificationConfig(notification.type);

                const Icon = config.icon;

                const requestId = notification.serviceRequest?._id;

                const serviceName = notification.serviceRequest?.service?.name;

                const isProcessing = processingId === notification._id;

                const content = (
                  <div
                    className={`
                        group relative flex gap-3
                        border-b border-slate-100
                        px-4 py-3.5
                        transition
                        ${
                          notification.isRead
                            ? "bg-white hover:bg-slate-50"
                            : "bg-blue-50/60 hover:bg-blue-50"
                        }
                      `}
                  >
                    {/* Icon */}
                    <div
                      className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl bg-slate-100
                          text-slate-600
                        "
                    >
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pr-5">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`
                              text-xs font-semibold
                              ${
                                notification.isRead
                                  ? "text-slate-700"
                                  : "text-slate-900"
                              }
                            `}
                        >
                          {notification.title || config.label}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      {serviceName && (
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          {serviceName}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                        <FiClock size={11} />

                        <span>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        handleDelete(notification);
                      }}
                      disabled={isProcessing}
                      aria-label="Delete notification"
                      title="Delete"
                      className="
                          absolute right-2 top-3
                          flex h-7 w-7
                          items-center justify-center
                          rounded-lg text-slate-300
                          opacity-0 transition
                          hover:bg-red-50
                          hover:text-red-500
                          group-hover:opacity-100
                          disabled:opacity-40
                        "
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                );

                /*
                 * If notification is related to a request,
                 * make it clickable.
                 */
                if (requestId) {
                  return (
                    <Link
                      key={notification._id}
                      to={`/request/status/${requestId}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="block w-full text-left"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          {/* ==================================================
              Footer
          ================================================== */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
              <p className="text-center text-[10px] text-slate-400">
                Showing your latest 50 notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
