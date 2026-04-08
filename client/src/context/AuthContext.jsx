import { createContext, useContext, useEffect, useState } from "react";

import api, { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "csir-net-auth";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(AUTH_STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setAuthToken(null);
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthToken(token);

    const syncUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (_error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    syncUser();
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
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

