import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL + "/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((tok, usr) => {
    if (tok) {
      localStorage.setItem("token", tok);
      axios.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
    setToken(tok);
    setUser(usr);
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`).then(r => {
        setUser(r.data);
        setLoading(false);
      }).catch(() => {
        setAuth(null, null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, setAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    setAuth(res.data.token, res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try { await axios.post(`${API}/auth/logout`); } catch {}
    setAuth(null, null);
  };

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";
  const canEdit = isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isInstructor, isStudent, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
