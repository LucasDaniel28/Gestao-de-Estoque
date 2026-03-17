import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeData } from './services/localStorageService';
import './index.css';

// Inicializa dados de exemplo no localStorage
initializeData();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
