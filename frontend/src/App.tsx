// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalarımızı import ediyoruz
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import FilesPage from './pages/FilesPage'; // "Dosyalarım" sayfası

// Korumalı rota ve ana layout component'lerini import ediyoruz
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Herkese açık rotalar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Ana dizine gidilirse otomatik olarak dashboard'a yönlendir */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Korumalı (sadece giriş yapmış kullanıcıların erişebileceği) rotalar */}
        {/* Bu rotalar artık MainLayout içinde render edilecek */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/:fileId" element={<FileDetailPage />} />
          <Route path="/history" element={<AnalysisHistoryPage />} />
          {/* Gelecekte eklenecek diğer sayfalar için örnek rotalar */}
          {/* <Route path="/reports" element={<ReportsPage />} /> */}
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;