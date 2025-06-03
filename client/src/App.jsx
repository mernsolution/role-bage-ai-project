
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import ShopDashboard from "./pages/ShopDashboard";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./layout/AppLayout";
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
             {/* Public routes  */}
            <Route path="/" element={ <PublicRoute> <SigninPage /> </PublicRoute>} />
            <Route path="/sign-up" element={ <PublicRoute> <SignupPage /></PublicRoute>}/>
            {/* Private routes */}
            <Route path="/dashboard" element={ <PrivateRoute> <Dashboard /> </PrivateRoute> } />
            <Route  path="/shop-dashboard" element={ <PrivateRoute> <ShopDashboard /> </PrivateRoute>}/>
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;

