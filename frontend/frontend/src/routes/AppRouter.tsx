import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={() => { /* yönlendirme veya state güncellemesi */ }} />} /> <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;