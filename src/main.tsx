import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css'; // Tus estilos CSS puros

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Captura tanto la raíz como posibles escaneos directos */}
        <Route path="/" element={<App />} />
        <Route path="/:uuid" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);