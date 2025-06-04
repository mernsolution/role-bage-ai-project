
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 Checking session with fetch...");
    fetch("http://localhost:8000/v1/check-session", {
      method: "GET",
      credentials: "include", 
    })
      .then(async (res) => {
        const data = await res.json();
        console.log("✅ Session check successful:", data);
        setIsAuthenticated(data.authenticated);
        setLoading(false);
      })
      .catch((err) => {
        console.log("❌ Session check failed:", err);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include", // ✅ important
      });
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


// import { createContext, useContext, useEffect, useState } from "react";
// import axiosInstance from '../utility/baseURL';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log("🔄 Checking session...");
//     debugger
//     axiosInstance.get("/check-session")
//       .then(res => {
//         console.log("✅ Session check successful:", res.data);
//         setIsAuthenticated(res.data.authenticated);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.log("❌ Session check failed:", err.response?.data || err.message);
//         setIsAuthenticated(false);
//         setLoading(false);
//       });
//   }, []);

//   const logout = async () => {
//     try {
//       await axiosInstance.post("/logout");
//       setIsAuthenticated(false);
//     } catch (err) {
//       console.error("Logout error:", err);
//       setIsAuthenticated(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
