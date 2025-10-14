// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import FilesPage from './pages/FilesPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import TeamPage from './pages/TeamPage'; 
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected app routes */}
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
          <Route path="/team" element={<TeamPage />} /> {/* YENİ ROTAYI EKLEDİK */}
          <Route path="/settings" element={<SettingsPage />} /> {/* YENİ ROTA */}

        </Route>
      </Routes>
    </Router>
  );
}

export default App;