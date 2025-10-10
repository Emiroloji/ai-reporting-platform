// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// Component'in alacağı props'lar için bir tip tanımı yapıyoruz.
// 'children' prop'unun tipi React.ReactNode olmalı, bu en esnek ve doğru tiptir.
type ProtectedRouteProps = {
  children: React.ReactNode;
};

// Component'imizi React.FC (Functional Component) olarak tanımlıyoruz.
// Bu, TypeScript'e bunun bir React component'i olduğunu net bir şekilde söyler.
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    // Token yoksa, login sayfasına yönlendir.
    return <Navigate to="/login" replace />;
  }

  // Token varsa, korunan sayfayı (children) göster.
  // Fragment (<>...</>) içine sarmak en güvenli yoldur.
  return <>{children}</>;
};

export default ProtectedRoute;