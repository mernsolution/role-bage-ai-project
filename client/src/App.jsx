
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkSession } from './store/slices/slices';
import SigninPage from "./pages/SigninPage.jsx";
import SignupPage from "./pages/SignUpPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./layout/AppLayout";


function App() {
  const dispatch = useDispatch();

  // Check session on app load
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Router>
      <AppLayout>
        <Routes>

          <Route
            path="/"
            element={
              <PublicRoute>
                <SigninPage />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Private routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />


          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

