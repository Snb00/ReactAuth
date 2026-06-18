import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getToken,
  setToken,
  clearToken,
  isTokenValid,
  getUser,
  login as apiLogin,
  register as apiRegister,
} from "./auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const t = getToken();
    return isTokenValid(t) ? t : null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t && isTokenValid(t)) {
      setToken(t);
      setTokenState(t);
      params.delete("token");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const t = await apiLogin(email, password);
    setToken(t);
    setTokenState(t);
  }, []);

  const register = useCallback(async (email, password) => {
    const t = await apiRegister(email, password);
    setToken(t);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user: token ? getUser(token) : null,
        isAuthed: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
