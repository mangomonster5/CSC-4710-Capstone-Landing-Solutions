import React, { useEffect } from "react";
import './App.css';
import AllFlightsPage from './Pages/AllFlightsPage';
import LoginPage from './Pages/Global/LoginPage';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import FlightSelectionPage from "./Pages/FlightSelectionPage";
import FlightInfoPage from "./Pages/FlightInfoPage";
import AdminPage from "./Pages/AdminPage";
import useAllStateContext from "./context/useAllStateContext";
import OnLaunchScripts from "./utils/OnLaunchScripts";

// Creating a type for protected routes, TypeScript makes you use... types this is defining them
type ProtectedRouteProps = {
  user: User;
  correctRole: UserRole;
  children: React.ReactNode;
};


/*
 * ProtectedRoute component
 *
 * This wraps pages to make sure the current active user only sees the pages they have access too.
 * Redirects unauthorized users to the login page.
 *
 * Props:
 * user: the current user object, containing authentication status and role
 * correctRole: the role required to access the route
 * children: the protected page(s) to render
 */


const ProtectedRoute = ({ user, correctRole, children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect runs when the component mounts and whenever `user` or `correctRole` change.
  // Its purpose is to prevent users with the wrong role from accessing a protected page.
  useEffect(() => {
    if (user.isAuthenticated && correctRole !== user.role) {
      // If the current user’s role does not match `correctRole`, the effect navigates back
      window.history.back();
    }
  }, [user, correctRole, navigate]);

  // If the user is not logged in, redirect immediately to the login page
  if (!user.isAuthenticated) return <Navigate to="/login" />;

  // console.log('User pushed to: ', location.pathname)
  return <>{children}</>;
};

const App: React.FC = () => {

  const { user, setUser } = useAllStateContext();

  OnLaunchScripts(); // runs once

  return (
    <BrowserRouter>
      <Routes>

        {/* Renders pages with MainLayou (Renders pages with navbar) */}
        <Route element={<MainLayout />}>

          <Route path="/all-flights" element={
            <ProtectedRoute user={user} correctRole="employee">
              <AllFlightsPage />
            </ProtectedRoute>
          }
          />

          <Route path="/flight-selection" element={
            <ProtectedRoute user={user} correctRole="employee">
              <FlightSelectionPage />
            </ProtectedRoute>
          }
          />

          <Route path="/admin" element={
            <ProtectedRoute user={user} correctRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
          />

          <Route path="/flight-info" element={
            <ProtectedRoute user={user} correctRole="employee">
              <FlightInfoPage />
            </ProtectedRoute>
          }
          />

        </Route>

        {/* No Nav Bar below this */}
        <Route path="/login" element={<LoginPage />} />


        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
