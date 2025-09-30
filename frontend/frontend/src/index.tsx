import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "antd/dist/reset.css"; // Ant Design için (gerekirse)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);