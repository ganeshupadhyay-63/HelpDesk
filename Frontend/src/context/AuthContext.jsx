import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentProvider,
  loginProvider,
  logoutProvider,
} from "../services/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("providerToken");

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentProvider();

        if (data.success) {
          setProvider(data.provider);
        }
      } catch (error) {
        console.error(
          "Session restore failed:",
          error
        );

        localStorage.removeItem("providerToken");
        setProvider(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    const data = await loginProvider(credentials);

    if (!data.success) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    localStorage.setItem(
      "providerToken",
      data.token
    );

    setProvider(data.provider);

    return data;
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("providerToken")) {
        await logoutProvider();
      }
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      localStorage.removeItem("providerToken");
      setProvider(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        provider,
        loading,
        isAuthenticated: Boolean(provider),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};