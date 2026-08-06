import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Load Tailwind layers and manuscript-aligned theme primitives first.
import './tailwind.css';
// Keep component-specific and browser compatibility rules after Tailwind.
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
