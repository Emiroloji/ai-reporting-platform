// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalarımızı import ediyoruz
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage'; // History sayfasını import ediyoruz

// Korumalı rotamız için component'i import ediyoruz
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Herkese açık rotalar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Korumalı (sadece giriş yapmış kullanıcıların erişebileceği) rotalar */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/files/:fileId"
          element={
            <ProtectedRoute>
              <FileDetailPage />
            </ProtectedRoute>
          }
        />
        {/* EKSİK OLAN ROTA BURASI */}
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <AnalysisHistoryPage />
            </ProtectedRoute>
          }
        />
        
        {/* Ana dizine gidilirse otomatik olarak login sayfasına yönlendir */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;