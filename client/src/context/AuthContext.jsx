
import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from '../utility/baseURL';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 Checking session...");
    
    axiosInstance.get("/check-session")
      .then(res => {
        console.log("✅ Session check successful:", res.data);
        setIsAuthenticated(res.data.authenticated);
        setLoading(false);
      })
      .catch(err => {
        console.log("❌ Session check failed:", err.response?.data || err.message);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
