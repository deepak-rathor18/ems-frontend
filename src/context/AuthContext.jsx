import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi, setUnauthorizedHandler } from "../services/api";
import { TOKEN_KEY } from "../constants";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(
    !!localStorage.getItem(TOKEN_KEY)
  );

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    });
  }, [clear]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((response) => {
        const loggedInUser =
          response?.data?.user ||
          response?.user ||
          null;

        setUser(loggedInUser);
      })
      .catch(() => {
        clear();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clear]);

  const login = async (email, password) => {
    const response = await authApi.login({
      email,
      password,
    });

    const token =
      response?.data?.token ||
      response?.token;

    if (!token) {
      throw new Error("Login token was not received");
    }

    localStorage.setItem(TOKEN_KEY, token);

    const meResponse = await authApi.me();

    const loggedInUser =
      meResponse?.data?.user ||
      meResponse?.user ||
      null;

    if (!loggedInUser) {
      throw new Error("User information was not received");
    }

    setUser(loggedInUser);

    return loggedInUser;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout: clear,
      isAuthenticated: !!user,
    }),
    [user, loading, clear]
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}
