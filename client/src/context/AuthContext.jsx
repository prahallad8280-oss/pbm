import { createContext, useContext, useEffect, useState } from "react";

import api, { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "csir-net-auth";
const AUTH_USER_STORAGE_KEY = "csir-net-auth-user";

const readStoredUser = () => {
  const rawValue = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

const persistAuthState = ({ token, user }) => {
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  }

  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }
};

const clearStoredAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY));
  const [user, setUser] = useState(() => readStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(AUTH_STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setAuthToken(null);
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthToken(token);
    setAuthLoading(true);

    let isMounted = true;
    let retryTimer;

    const syncUser = async (attempt = 0) => {
      try {
        const { data } = await api.get("/auth/me");

        if (!isMounted) {
          return;
        }

        setUser(data.user);
        persistAuthState({ token, user: data.user });
        setAuthLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const status = error.response?.status;
        const shouldClearAuth = status === 401 || status === 403;

        if (shouldClearAuth) {
          clearStoredAuthState();
          setAuthToken(null);
          setToken(null);
          setUser(null);
          setAuthLoading(false);
          return;
        }

        if (attempt < 1) {
          retryTimer = window.setTimeout(() => {
            syncUser(attempt + 1);
          }, 1500);
          return;
        }

        setAuthLoading(false);
      }
    };

    syncUser();

    return () => {
      isMounted = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    persistAuthState({ token: data.token, user: data.user });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistAuthState({ token: data.token, user: data.user });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearStoredAuthState();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        token,
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
